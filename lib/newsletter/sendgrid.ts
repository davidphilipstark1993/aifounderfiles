import { env, requireEnv } from './env.js';

const API = 'https://api.sendgrid.com/v3';
const BATCH_SIZE = 900; // SendGrid allows up to 1000 personalizations per request

const headers = () => ({
  Authorization: `Bearer ${requireEnv('SENDGRID_API_KEY').SENDGRID_API_KEY}`,
  'Content-Type': 'application/json',
});

export const unsubscribeGroupId = (): number | undefined => {
  const raw = env('SENDGRID_UNSUBSCRIBE_GROUP_ID');
  return raw ? Number(raw) : undefined;
};

const from = () => ({
  email: env('SENDGRID_FROM_EMAIL') || 'info@aifounderfiles.com',
  name: env('SENDGRID_FROM_NAME') || 'AI Founder Files',
});

/** Adds/updates a Marketing Contact. SendGrid processes this asynchronously and returns a job id. */
export async function upsertContact(email: string): Promise<string> {
  const listId = env('SENDGRID_LIST_ID');
  const res = await fetch(`${API}/marketing/contacts`, {
    method: 'PUT',
    headers: headers(),
    body: JSON.stringify({ list_ids: listId ? [listId] : undefined, contacts: [{ email }] }),
  });
  if (!res.ok) throw new Error(`SendGrid contacts error ${res.status}: ${await res.text()}`);
  return ((await res.json()) as { job_id: string }).job_id;
}

/** Re-subscribing must lift an earlier unsubscribe, or SendGrid will keep suppressing the address. */
export async function removeUnsubscribe(email: string): Promise<void> {
  const group = unsubscribeGroupId();
  if (!group) return;
  const res = await fetch(`${API}/asm/groups/${group}/suppressions/${encodeURIComponent(email)}`, {
    method: 'DELETE',
    headers: headers(),
  });
  if (!res.ok && res.status !== 404) throw new Error(`SendGrid suppression error ${res.status}: ${await res.text()}`);
}

export interface Message {
  subject: string;
  html: string;
  text: string;
  categories?: string[];
}

/** Sends one message per recipient (each in its own personalization, so no one sees other addresses). */
export type UnsubscribeMode = 'required' | 'if-configured' | 'none';

export async function sendBatch(recipients: string[], message: Message, opts: { unsubscribe: UnsubscribeMode }): Promise<string> {
  const group = opts.unsubscribe === 'none' ? undefined : unsubscribeGroupId();
  if (opts.unsubscribe === 'required' && !group) throw new Error('SENDGRID_UNSUBSCRIBE_GROUP_ID is required for newsletter sends');
  const res = await fetch(`${API}/mail/send`, {
    method: 'POST',
    headers: headers(),
    body: JSON.stringify({
      personalizations: recipients.map((email) => ({ to: [{ email }] })),
      from: from(),
      subject: message.subject,
      content: [
        { type: 'text/plain', value: message.text },
        { type: 'text/html', value: message.html },
      ],
      ...(message.categories ? { categories: message.categories } : {}),
      ...(group ? { asm: { group_id: group } } : {}),
    }),
  });
  if (!res.ok) throw new Error(`SendGrid mail/send error ${res.status}: ${await res.text()}`);
  return res.headers.get('x-message-id') ?? '';
}

export async function sendInBatches(
  recipients: string[],
  message: Message,
  onBatch?: (sentSoFar: number, messageId: string) => Promise<void> | void,
): Promise<{ sent: number; lastMessageId: string }> {
  let sent = 0;
  let lastMessageId = '';
  for (let i = 0; i < recipients.length; i += BATCH_SIZE) {
    const batch = recipients.slice(i, i + BATCH_SIZE);
    lastMessageId = (await sendBatch(batch, message, { unsubscribe: 'required' })) || lastMessageId;
    sent += batch.length;
    await onBatch?.(sent, lastMessageId);
  }
  return { sent, lastMessageId };
}

/** Plain-text alert to the site owner(s). Never throws: a failed alert must not mask the real result. */
export async function notifyAdmin(subject: string, body: string): Promise<void> {
  const to = env('ADMIN_EMAILS').split(',').map((s) => s.trim()).filter(Boolean);
  if (!to.length || !env('SENDGRID_API_KEY')) {
    console.log(`[notifyAdmin skipped] ${subject}\n${body}`);
    return;
  }
  try {
    await sendBatch(to, { subject: `[AI Founder Files] ${subject}`, html: `<pre style="font:14px/1.5 monospace">${body.replace(/&/g, '&amp;').replace(/</g, '&lt;')}</pre>`, text: body }, { unsubscribe: 'none' });
  } catch (err) {
    console.error('notifyAdmin failed:', err);
  }
}
