// Weekly newsletter send. Run by .github/workflows/weekly-newsletter-send.yml (Sundays, 08:00 UTC).
//
//   tsx scripts/newsletter/weekly-send.ts                 send the newest published file, if not sent yet
//   tsx scripts/newsletter/weekly-send.ts --dry-run       render + report, send nothing
//   tsx scripts/newsletter/weekly-send.ts --test          send ONE copy to ADMIN_EMAILS, record nothing
//   tsx scripts/newsletter/weekly-send.ts --slug=acme-ai  use a specific file instead of the newest
//   tsx scripts/newsletter/weekly-send.ts --resume        finish a send that stopped part-way
//
// "Published" means draft: false and publishDate <= today. Setting draft: false IS the approval.
import fs from 'node:fs';
import path from 'node:path';
import matter from 'gray-matter';
import { env } from '../../lib/newsletter/env.js';
import { adminClient } from '../../lib/newsletter/supabase.js';
import { notifyAdmin, sendBatch, sendInBatches } from '../../lib/newsletter/sendgrid.js';
import { renderIssue, type IssueFile } from '../../lib/newsletter/templates.js';

const FILES_DIR = path.join(process.cwd(), 'src/content/files');
/** Don't email a file that has been published for longer than this (guards against back-catalogue blasts). */
const MAX_AGE_DAYS = 10;

const args = new Set(process.argv.slice(2));
const flag = (name: string) => args.has(`--${name}`);
const slugArg = process.argv.slice(2).find((a) => a.startsWith('--slug='))?.slice(7);

interface PublishedFile extends IssueFile {
  draft: boolean;
}

function loadFiles(): PublishedFile[] {
  return fs
    .readdirSync(FILES_DIR)
    .filter((f) => /\.mdx?$/.test(f))
    .map((f) => {
      const d = matter(fs.readFileSync(path.join(FILES_DIR, f), 'utf8')).data;
      return {
        slug: f.replace(/\.mdx?$/, ''),
        title: String(d.title),
        standfirst: String(d.standfirst),
        fileNumber: Number(d.fileNumber),
        publishDate: new Date(d.publishDate),
        founder: { name: String(d.founder?.name), role: String(d.founder?.role ?? '') },
        company: {
          name: String(d.company?.name),
          sector: String(d.company?.sector),
          founded: d.company?.founded == null ? undefined : String(d.company.founded),
          hq: d.company?.hq,
          funding: d.company?.funding,
        },
        draft: d.draft === true,
      };
    });
}

async function main() {
  const now = new Date();
  const published = loadFiles()
    .filter((f) => !f.draft && f.publishDate.getTime() <= now.getTime())
    .sort((a, b) => b.publishDate.getTime() - a.publishDate.getTime() || b.fileNumber - a.fileNumber);

  const file = slugArg ? published.find((f) => f.slug === slugArg) : published[0];
  if (!file) {
    const why = slugArg ? `No published file with slug "${slugArg}".` : 'There are no published files (draft: false, publishDate in the past).';
    console.log(why);
    await notifyAdmin('Newsletter not sent: nothing to send', `${why}\n\nPublish a file by setting draft: false in its frontmatter and pushing to main.`);
    return;
  }

  const ageDays = (now.getTime() - file.publishDate.getTime()) / 86_400_000;
  if (!slugArg && ageDays > MAX_AGE_DAYS) {
    const msg = `The newest published file ("${file.title}", ${file.publishDate.toISOString().slice(0, 10)}) is ${Math.floor(ageDays)} days old, so it was not emailed. No new file was published this week.\n\nTo send it anyway, run the workflow manually with slug "${file.slug}".`;
    console.log(msg);
    await notifyAdmin('Newsletter not sent: no new file this week', msg);
    return;
  }

  const message = renderIssue(file);
  console.log(`File: ${file.slug} (#${file.fileNumber}) — subject: ${message.subject}`);

  if (flag('dry-run')) {
    console.log('Dry run: nothing sent or recorded.');
    return;
  }

  if (flag('test')) {
    const to = env('ADMIN_EMAILS').split(',').map((s) => s.trim()).filter(Boolean);
    if (!to.length) throw new Error('ADMIN_EMAILS is not set; nowhere to send the test copy.');
    await sendBatch(to, { ...message, subject: `[TEST] ${message.subject}` }, { unsubscribe: 'required' });
    console.log(`Test copy sent to ${to.length} admin address(es). Nothing recorded.`);
    return;
  }

  const supabase = adminClient();

  // --- Idempotency: a file is never sent twice. ---
  const { data: prior } = await supabase.from('newsletter_sends').select('*').eq('file_slug', file.slug).maybeSingle();
  let alreadySent = 0;
  if (prior) {
    if (prior.status === 'sent') {
      const msg = `File "${file.slug}" was already sent on ${prior.sent_at} to ${prior.sent_count} subscribers. Nothing to do.`;
      console.log(msg);
      await notifyAdmin('Newsletter not sent: already sent', `${msg}\n\nPublish a newer file to send again.`);
      return;
    }
    if (!flag('resume')) {
      const msg = `A previous send of "${file.slug}" did not finish (status: ${prior.status}, ${prior.sent_count}/${prior.recipient_count} sent).\n${prior.error ? `Error: ${prior.error}\n` : ''}\nNothing was sent now, to avoid emailing anyone twice. Check SendGrid's activity feed, then re-run with "resume" to send to the remaining subscribers.`;
      console.error(msg);
      await notifyAdmin('Newsletter NOT sent: previous send incomplete', msg);
      process.exitCode = 1;
      return;
    }
    alreadySent = prior.sent_count;
  }

  // Stable order so "resume" can skip exactly the people already emailed.
  const recipients: string[] = [];
  for (let from = 0; ; from += 1000) {
    const { data, error } = await supabase
      .from('newsletter_subscribers')
      .select('email')
      .eq('status', 'active')
      .order('created_at', { ascending: true })
      .order('id', { ascending: true })
      .range(from, from + 999);
    if (error) throw new Error(`Could not load subscribers: ${error.message}`);
    recipients.push(...data.map((r) => r.email));
    if (data.length < 1000) break;
  }

  if (!recipients.length) {
    await notifyAdmin('Newsletter not sent: no active subscribers', `"${file.title}" is ready but there are no active subscribers yet.`);
    console.log('No active subscribers.');
    return;
  }

  if (prior) {
    await supabase.from('newsletter_sends').update({ status: 'sending', error: null }).eq('file_slug', file.slug);
  } else {
    const { error } = await supabase
      .from('newsletter_sends')
      .insert({ file_slug: file.slug, subject: message.subject, status: 'sending', recipient_count: recipients.length });
    if (error) throw new Error(`Could not record the send (another run may be in progress): ${error.message}`);
  }

  const todo = recipients.slice(alreadySent);
  let sentThisRun = 0;
  try {
    const { sent, lastMessageId } = await sendInBatches(todo, message, async (sentSoFar, messageId) => {
      sentThisRun = sentSoFar;
      await supabase
        .from('newsletter_sends')
        .update({ sent_count: alreadySent + sentSoFar, sendgrid_message_id: messageId })
        .eq('file_slug', file.slug);
    });
    await supabase
      .from('newsletter_sends')
      .update({ status: 'sent', sent_count: alreadySent + sent, recipient_count: recipients.length, sent_at: new Date().toISOString(), sendgrid_message_id: lastMessageId })
      .eq('file_slug', file.slug);
    const msg = `"${file.title}" (Founder File #${file.fileNumber}) was sent to ${alreadySent + sent} subscribers.\nSendGrid message id: ${lastMessageId}\nRead it: ${env('SITE_URL') || 'https://aifounderfiles.com'}/files/${file.slug}/`;
    console.log(msg);
    await notifyAdmin(`Newsletter sent: #${file.fileNumber}`, msg);
  } catch (err) {
    const detail = err instanceof Error ? err.message : String(err);
    await supabase.from('newsletter_sends').update({ status: 'failed', error: detail.slice(0, 1000) }).eq('file_slug', file.slug);
    await notifyAdmin(
      'Newsletter send FAILED part-way',
      `"${file.title}" stopped after ${alreadySent + sentThisRun} of ${recipients.length} recipients.\n\n${detail}\n\nNo one will be emailed twice: re-run the workflow with "resume" ticked to finish the remaining subscribers.`,
    );
    console.error(err);
    process.exitCode = 1;
  }
}

main().catch(async (err) => {
  console.error('Weekly newsletter send crashed:', err);
  await notifyAdmin('Newsletter send CRASHED', err instanceof Error ? (err.stack ?? err.message) : String(err));
  process.exit(1);
});
