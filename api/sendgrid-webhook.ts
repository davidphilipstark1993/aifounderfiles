// POST /api/sendgrid-webhook — SendGrid's Event Webhook. Keeps our subscriber list in step with
// unsubscribes, bounces and spam reports so future sends skip them automatically.
import { EventWebhook, EventWebhookHeader } from '@sendgrid/eventwebhook';
import { env } from '../lib/newsletter/env.js';
import { adminClient, type SubscriberStatus } from '../lib/newsletter/supabase.js';

interface SendGridEvent {
  email?: string;
  event?: string;
}

const STATUS_BY_EVENT: Record<string, SubscriberStatus> = {
  unsubscribe: 'unsubscribed',
  group_unsubscribe: 'unsubscribed',
  bounce: 'bounced',
  spamreport: 'suppressed',
};

export async function POST(request: Request): Promise<Response> {
  const publicKey = env('SENDGRID_WEBHOOK_VERIFICATION_KEY');
  if (!publicKey) {
    console.error('sendgrid-webhook: SENDGRID_WEBHOOK_VERIFICATION_KEY is not configured');
    return new Response('Webhook not configured', { status: 500 });
  }

  // Signature verification needs the exact raw body, so read text() before parsing.
  const payload = await request.text();
  const signature = request.headers.get(EventWebhookHeader.SIGNATURE());
  const timestamp = request.headers.get(EventWebhookHeader.TIMESTAMP());
  if (!signature || !timestamp) return new Response('Missing signature', { status: 401 });

  const webhook = new EventWebhook();
  let valid = false;
  try {
    valid = webhook.verifySignature(webhook.convertPublicKeyToECDSA(publicKey), payload, signature, timestamp);
  } catch {
    valid = false;
  }
  if (!valid) return new Response('Invalid signature', { status: 401 });

  let events: SendGridEvent[];
  try {
    events = JSON.parse(payload);
  } catch {
    return new Response('Bad payload', { status: 400 });
  }

  const supabase = adminClient();
  for (const e of events) {
    const email = e.email?.toLowerCase();
    const status = e.event ? STATUS_BY_EVENT[e.event] : undefined;
    if (!email || !status) continue;
    try {
      await supabase
        .from('newsletter_subscribers')
        .update({ status, unsubscribed_at: new Date().toISOString() })
        .eq('email', email);
    } catch (err) {
      // One bad event must not drop the rest of the batch.
      console.error('sendgrid-webhook: could not apply event', e.event, err);
    }
  }
  return new Response(JSON.stringify({ ok: true }), { status: 200, headers: { 'Content-Type': 'application/json' } });
}
