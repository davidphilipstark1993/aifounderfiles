// GET /api/ads/?slots=home-promo,home-between → the adverts each slot on the page may show.
// Public and cacheable: it only returns what is live right now (active, not archived, inside its dates)
// and nothing about scheduling. Highest priority first; equal priorities take turns.
import { adminClient } from '../lib/newsletter/supabase.js';
import { liveAds, toPublic } from '../lib/ads/store.js';
import { SLOT_KEYS, pickAds, slotConfig, type PublicAd } from '../lib/ads/shared.js';

const json = (body: Record<string, unknown>, status = 200, cache = 'public, s-maxage=30, stale-while-revalidate=120') =>
  new Response(JSON.stringify(body), { status, headers: { 'Content-Type': 'application/json', 'Cache-Control': cache } });

export async function GET(request: Request): Promise<Response> {
  const slots = [...new Set((new URL(request.url).searchParams.get('slots') ?? '').split(',').map((s) => s.trim()))].filter((s) => SLOT_KEYS.includes(s));
  if (!slots.length) return json({ ok: true, ads: {}, slots: {} });
  try {
    const supabase = adminClient();
    const live = await liveAds(supabase);
    const ads: Record<string, PublicAd> = {};
    const bySlot: Record<string, string[]> = {};
    for (const slot of slots) {
      // A few spare candidates so the page can skip an advert already shown in an earlier slot.
      const picked = pickAds(live, slot, (slotConfig(slot)?.max ?? 1) + 3);
      bySlot[slot] = picked.map((a) => a.id);
      for (const a of picked) ads[a.id] ??= toPublic(supabase, a);
    }
    return json({ ok: true, ads, slots: bySlot });
  } catch (err) {
    console.error('ads: could not load adverts:', err);
    // Failing quietly is right: the page simply shows no advert. Not cached, so it recovers at once.
    return json({ ok: false, ads: {}, slots: {} }, 200, 'no-store');
  }
}
