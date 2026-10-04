// PDF issues: storage helpers and the send routine shared by the admin page (send now / resume) and
// the Sunday GitHub Action. A send is claimed with one conditional UPDATE, so an issue can never be
// sent twice, even if two runs start at the same moment.
import type { SupabaseClient } from '@supabase/supabase-js';
import { env, SITE_URL } from './env.js';
import { adminClient } from './supabase.js';
import { notifyAdmin, sendBatch, sendInBatches } from './sendgrid.js';
import { renderPdfIssue } from './templates.js';

export const BUCKET = 'issues';
export const MAX_AGE_DAYS = 10;

export interface IssueRow {
  id: string;
  issue_number: number;
  title: string;
  note: string | null;
  pdf_path: string;
  pdf_name: string;
  status: 'draft' | 'approved' | 'sending' | 'sent' | 'failed';
  recipient_count: number;
  sent_count: number;
  sendgrid_message_id: string | null;
  error: string | null;
  created_at: string;
  approved_at: string | null;
  sent_at: string | null;
}

export const pdfUrl = (supabase: SupabaseClient, path: string) => supabase.storage.from(BUCKET).getPublicUrl(path).data.publicUrl;

export const messageFor = (supabase: SupabaseClient, issue: IssueRow, date = new Date(issue.created_at)) =>
  renderPdfIssue({ issueNumber: issue.issue_number, title: issue.title, note: issue.note, pdfUrl: pdfUrl(supabase, issue.pdf_path), date });

const adminEmails = () => env('ADMIN_EMAILS').split(',').map((s) => s.trim()).filter(Boolean);

/** Sends one copy to ADMIN_EMAILS. Records nothing. */
export async function sendTest(supabase: SupabaseClient, issue: IssueRow): Promise<number> {
  const to = adminEmails();
  if (!to.length) throw new Error('ADMIN_EMAILS is not set, so there is nowhere to send the test copy.');
  const message = messageFor(supabase, issue);
  await sendBatch(to, { ...message, subject: `[TEST] ${message.subject}` }, { unsubscribe: 'required' });
  return to.length;
}

async function activeRecipients(supabase: SupabaseClient): Promise<string[]> {
  // Stable order so "resume" can skip exactly the people already emailed.
  const out: string[] = [];
  for (let from = 0; ; from += 1000) {
    const { data, error } = await supabase
      .from('newsletter_subscribers')
      .select('email')
      .eq('status', 'active')
      .order('created_at', { ascending: true })
      .order('id', { ascending: true })
      .range(from, from + 999);
    if (error) throw new Error(`Could not load subscribers: ${error.message}`);
    out.push(...data.map((r) => r.email));
    if (data.length < 1000) break;
  }
  return out;
}

export interface SendResult {
  ok: boolean;
  message: string;
  sent?: number;
}

/** Emails an approved issue to every active subscriber. `resume` finishes an interrupted send. */
export async function sendIssue(issueId: string, opts: { resume?: boolean } = {}): Promise<SendResult> {
  const supabase = adminClient();

  const { data: current, error: loadError } = await supabase.from('newsletter_issues').select('*').eq('id', issueId).maybeSingle();
  if (loadError || !current) return { ok: false, message: 'Issue not found.' };
  const issue = current as IssueRow;

  if (issue.status === 'sent') return { ok: false, message: `Issue #${issue.issue_number} was already sent on ${issue.sent_at}.` };
  if (issue.status === 'draft') return { ok: false, message: 'Approve the issue before sending it.' };
  if (issue.status !== 'approved' && !opts.resume) {
    return {
      ok: false,
      message: `A previous send of issue #${issue.issue_number} did not finish (${issue.sent_count}/${issue.recipient_count} sent). Check SendGrid's activity feed, then use Resume to email the remaining subscribers.`,
    };
  }

  const recipients = await activeRecipients(supabase);
  if (!recipients.length) return { ok: false, message: 'There are no active subscribers yet.' };

  const alreadySent = issue.status === 'approved' ? 0 : issue.sent_count;

  // Claim the send. Exactly one caller can move the row out of its current status.
  const { data: claimed, error: claimError } = await supabase
    .from('newsletter_issues')
    .update({ status: 'sending', error: null, recipient_count: recipients.length, ...(alreadySent ? {} : { sent_count: 0 }) })
    .eq('id', issue.id)
    .eq('status', issue.status)
    .select('id');
  if (claimError) return { ok: false, message: `Could not start the send: ${claimError.message}` };
  if (!claimed?.length) return { ok: false, message: 'Another send of this issue is already running.' };

  const message = messageFor(supabase, issue, new Date());
  let sentThisRun = 0;
  try {
    const { sent, lastMessageId } = await sendInBatches(recipients.slice(alreadySent), message, async (soFar, messageId) => {
      sentThisRun = soFar;
      await supabase.from('newsletter_issues').update({ sent_count: alreadySent + soFar, sendgrid_message_id: messageId }).eq('id', issue.id);
    });
    const total = alreadySent + sent;
    await supabase
      .from('newsletter_issues')
      .update({ status: 'sent', sent_count: total, sent_at: new Date().toISOString(), sendgrid_message_id: lastMessageId })
      .eq('id', issue.id);
    const text = `Issue #${issue.issue_number} "${issue.title}" was sent to ${total} subscribers.\nSendGrid message id: ${lastMessageId}\nPDF: ${pdfUrl(supabase, issue.pdf_path)}`;
    await notifyAdmin(`Newsletter sent: #${issue.issue_number}`, text);
    return { ok: true, message: `Sent to ${total} subscribers.`, sent: total };
  } catch (err) {
    const detail = err instanceof Error ? err.message : String(err);
    await supabase.from('newsletter_issues').update({ status: 'failed', error: detail.slice(0, 1000) }).eq('id', issue.id);
    await notifyAdmin(
      'Newsletter send FAILED part-way',
      `Issue #${issue.issue_number} "${issue.title}" stopped after ${alreadySent + sentThisRun} of ${recipients.length} recipients.\n\n${detail}\n\nNo one will be emailed twice: open ${SITE_URL}/admin/ and press Resume to finish the remaining subscribers.`,
    );
    return { ok: false, message: `Send stopped part-way: ${detail}` };
  }
}
