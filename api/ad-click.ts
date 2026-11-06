// GET /api/ad-click/?a=<advertId>&p=<slot> → counts the click, then sends the visitor to the advert's
// destination with UTM parameters. Only the id is read from the URL; the destination always comes from
// the database, so this cannot be used as an open redirect.
import { adminClient } from '../lib/newsletter/supabase.js';
import { recordEvent } from '../lib/ads/store.js';
import { SLOT_KEYS, destinationWithUtm, looksLikeBot, type AdRow } from '../lib/ads/shared.js';
import { SITE_URL } from '../lib/newsletter/env.js';

const UUID_RE = /^[0-9a-f-]{36}$/i;
const home = () => new Response(null, { status: 302, headers: { Location: SITE_URL, 'Cache-Control': 'no-store' } });

export async function GET(request: Request): Promise<Response> {
  const q = new URL(request.url).searchParams;
  const id = q.get('a') ?? '';
  const slot = SLOT_KEYS.includes(q.get('p') ?? '') ? (q.get('p') as string) : 'sitewide';
  if (!UUID_RE.test(id)) return home();
  try {
    const supabase = adminClient();
    const { data } = await supabase.from('advertisements').select('*').eq('id', id).maybeSingle();
    const ad = data as AdRow | null;
    if (!ad) return home();
    // A click on an advert that has just expired or been paused still goes through: the visitor saw it while it was live.
    if (!looksLikeBot(request.headers.get('user-agent'))) {
      try {
        await recordEvent(supabase, id, slot, 'click');
      } catch (err) {
        console.error('ad-click: could not record click:', err instanceof Error ? err.message : err);
      }
    }
    return new Response(null, {
      status: 302,
      headers: { Location: destinationWithUtm(ad, slot), 'Cache-Control': 'no-store', 'Referrer-Policy': 'origin' },
    });
  } catch (err) {
    console.error('ad-click failed:', err);
    return home();
  }
}
