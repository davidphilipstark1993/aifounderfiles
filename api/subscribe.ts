// POST /api/subscribe — runs as a Vercel Function; the rest of the site stays static.
// Order matters (same as listentruecrime.com): save the subscriber FIRST, then sync to SendGrid,
// then send the welcome email. A provider failure is logged and never loses the subscriber.
import { env, SITE_URL } from '../lib/newsletter/env.js';
import { adminClient } from '../lib/newsletter/supabase.js';
import { removeUnsubscribe, sendBatch, unsubscribeGroupId, upsertContact } from '../lib/newsletter/sendgrid.js';
import { renderWelcome } from '../lib/newsletter/templates.js';

const EMAIL_RE = /^[^\s@]+@[^\s@]+\.[^\s@]{2,}$/;

const json = (body: Record<string, unknown>, status = 200) =>
  new Response(JSON.stringify(body), { status, headers: { 'Content-Type': 'application/json', 'Cache-Control': 'no-store' } });

const redirect = (path: string) => new Response(null, { status: 303, headers: { Location: new URL(path, SITE_URL).href } });

interface Input {
  email: string;
  consent: boolean;
  source: string;
  honeypot: string;
}

async function readInput(request: Request): Promise<{ input: Input; isForm: boolean }> {
  const type = request.headers.get('content-type') ?? '';
  if (type.includes('application/json')) {
    const b = (await request.json().catch(() => ({}))) as Record<string, unknown>;
    return {
      isForm: false,
      input: {
        email: typeof b.email === 'string' ? b.email : '',
        consent: b.consent === true,
        source: typeof b.source === 'string' ? b.source : 'unknown',
        honeypot: typeof b.website === 'string' ? b.website : '',
      },
    };
  }
  const f = await request.formData().catch(() => new FormData());
  return {
    isForm: true,
    input: {
      email: String(f.get('email') ?? ''),
      consent: ['on', 'true', '1'].includes(String(f.get('consent') ?? '')),
      source: String(f.get('source') ?? 'unknown'),
      honeypot: String(f.get('website') ?? ''),
    },
  };
}

export async function POST(request: Request): Promise<Response> {
  const { input, isForm } = await readInput(request);
  const fail = (message: string, status: number) =>
    isForm ? redirect(`/subscribe/?problem=${status === 400 ? 'invalid' : 'unavailable'}`) : json({ ok: false, error: message }, status);

  // Bots fill the hidden "website" field. Pretend it worked and do nothing.
  if (input.honeypot) return isForm ? redirect('/subscribed/') : json({ ok: true });

  const email = input.email.toLowerCase().trim();
  if (!email || email.length > 254 || !EMAIL_RE.test(email)) return fail('Enter a valid email address.', 400);
  if (!input.consent) return fail('Please confirm you’d like to receive the newsletter.', 400);

  if (!env('SUPABASE_URL') || !env('SUPABASE_SERVICE_ROLE_KEY') || !env('SENDGRID_API_KEY')) {
    console.error('subscribe: signup is not configured (missing Supabase or SendGrid env vars)');
    return fail('Signup isn’t available just yet. Please check back soon.', 503);
  }

  const supabase = adminClient();

  const { data: existing } = await supabase
    .from('newsletter_subscribers')
    .select('status, welcome_sent')
    .eq('email', email)
    .maybeSingle();

  const now = new Date().toISOString();
  const { error: saveError } = await supabase.from('newsletter_subscribers').upsert(
    {
      email,
      source: (input.source || 'unknown').slice(0, 60),
      consent: true,
      consent_at: now,
      status: 'active',
      unsubscribed_at: null,
    },
    { onConflict: 'email' },
  );
  if (saveError) {
    console.error('subscribe: could not save subscriber:', saveError.message);
    return fail('Something went wrong. Please try again in a moment.', 500);
  }

  // Someone who unsubscribed earlier and signs up again has given fresh consent: lift the suppression.
  try {
    if (existing && existing.status !== 'active') await removeUnsubscribe(email);
    const jobId = await upsertContact(email);
    await supabase.from('newsletter_subscribers').update({ sendgrid_synced: true, sendgrid_job_id: jobId }).eq('email', email);
  } catch (err) {
    console.error('subscribe: SendGrid sync failed (subscriber is saved; retry later):', err);
  }

  // Awaited, not fire-and-forget: a serverless function is frozen once it responds.
  if (!existing?.welcome_sent) {
    try {
      await sendBatch([email], renderWelcome({ unsubscribeAvailable: Boolean(unsubscribeGroupId()) }), { unsubscribe: 'if-configured' });
      await supabase.from('newsletter_subscribers').update({ welcome_sent: true }).eq('email', email);
    } catch (err) {
      console.error('subscribe: welcome email failed:', err);
    }
  }

  return isForm ? redirect('/subscribed/') : json({ ok: true });
}
