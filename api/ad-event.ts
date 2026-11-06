// POST /api/ad-event/ {a: advertId, p: slot} → counts one viewable impression.
// Sent with navigator.sendBeacon once an advert has been at least half visible for a second.
// Stores a counter only: no IP address, cookie or visitor identifier.
import { adminClient } from '../lib/newsletter/supabase.js';
import { recordEvent } from '../lib/ads/store.js';
import { SLOT_KEYS, looksLikeBot } from '../lib/ads/shared.js';

const UUID_RE = /^[0-9a-f-]{36}$/i;
const none = (status = 204) => new Response(null, { status, headers: { 'Cache-Control': 'no-store' } });

export async function POST(request: Request): Promise<Response> {
  if (looksLikeBot(request.headers.get('user-agent'))) return none();
  const raw = await request.text().catch(() => '');
  if (raw.length > 500) return none(400);
  let b: { a?: unknown; p?: unknown } = {};
  try {
    b = JSON.parse(raw);
  } catch {
    return none(400);
  }
  if (typeof b.a !== 'string' || !UUID_RE.test(b.a) || typeof b.p !== 'string' || !SLOT_KEYS.includes(b.p)) return none(400);
  try {
    await recordEvent(adminClient(), b.a, b.p, 'impression');
  } catch (err) {
    console.error('ad-event: could not record impression:', err instanceof Error ? err.message : err);
  }
  return none();
}
