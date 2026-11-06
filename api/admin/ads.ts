// /api/admin/ads/: everything the Advertisements tab needs. Every handler checks the session cookie first.
//   GET            → all adverts (with image URLs and lifetime counts)
//   GET ?days=30&ad=<id> → analytics for the last N days, optionally for one advert
//   POST { action: 'prepare' | 'create' | 'update' | 'set-active' | 'archive' | 'restore' | 'delete' }
// Images never pass through this function (Vercel limits request bodies to 4.5 MB): 'prepare' returns two
// short-lived signed URLs and the browser uploads the optimised WebP files straight to Supabase Storage.
import { randomBytes, randomUUID } from 'node:crypto';
import { isAdmin } from '../../lib/newsletter/admin-auth.js';
import { adminClient } from '../../lib/newsletter/supabase.js';
import { AD_BUCKET, checkUploadedImages, imageUrl, removeImages } from '../../lib/ads/store.js';
import { smallImagePath, validateAdInput, type AdRow } from '../../lib/ads/shared.js';

const json = (body: Record<string, unknown>, status = 200) =>
  new Response(JSON.stringify(body), { status, headers: { 'Content-Type': 'application/json', 'Cache-Control': 'no-store' } });

const UUID_RE = /^[0-9a-f-]{36}$/i;

interface Counts { ad_id: string; impressions: number; clicks: number }

export async function GET(request: Request): Promise<Response> {
  if (!isAdmin(request)) return json({ ok: false, error: 'Not signed in.' }, 401);
  const q = new URL(request.url).searchParams;
  const supabase = adminClient();

  if (q.has('days')) {
    const days = Math.min(365, Math.max(1, Math.floor(Number(q.get('days')) || 30)));
    const ad = q.get('ad');
    if (ad && !UUID_RE.test(ad)) return json({ ok: false, error: 'Bad request.' }, 400);
    const { data, error } = await supabase.rpc('ad_analytics', { p_days: days, p_ad: ad || null });
    if (error) return json({ ok: false, error: error.message }, 500);
    return json({ ok: true, days, ...(data as Record<string, unknown>) });
  }

  const { data, error } = await supabase.from('advertisements').select('*').order('created_at', { ascending: false });
  if (error) return json({ ok: false, error: error.message }, 500);
  const { data: life } = await supabase.rpc('ad_analytics', { p_days: 1 });
  const lifetime = new Map(((life as { lifetime?: Counts[] } | null)?.lifetime ?? []).map((c) => [c.ad_id, c]));
  const ads = (data as AdRow[]).map((ad) => ({
    ...ad,
    image_url: imageUrl(supabase, ad.image_path),
    image_url_sm: imageUrl(supabase, smallImagePath(ad.image_path)),
    impressions: lifetime.get(ad.id)?.impressions ?? 0,
    clicks: lifetime.get(ad.id)?.clicks ?? 0,
  }));
  return json({ ok: true, ads });
}

export async function POST(request: Request): Promise<Response> {
  if (!isAdmin(request)) return json({ ok: false, error: 'Not signed in.' }, 401);
  // JSON only: together with the SameSite=Strict cookie this blocks cross-site form posts.
  if (!(request.headers.get('content-type') ?? '').includes('application/json')) return json({ ok: false, error: 'Bad request.' }, 400);
  const b = (await request.json().catch(() => ({}))) as Record<string, unknown>;
  const action = typeof b.action === 'string' ? b.action : '';
  const supabase = adminClient();

  try {
    if (action === 'prepare') {
      const base = `${randomUUID()}/${randomBytes(8).toString('hex')}`;
      const path = `${base}-1280.webp`;
      const sm = smallImagePath(path);
      const [full, thumb] = await Promise.all([
        supabase.storage.from(AD_BUCKET).createSignedUploadUrl(path),
        supabase.storage.from(AD_BUCKET).createSignedUploadUrl(sm),
      ]);
      if (full.error || !full.data || thumb.error || !thumb.data) {
        return json({ ok: false, error: `Could not start the upload: ${full.error?.message ?? thumb.error?.message ?? 'unknown error'}` }, 500);
      }
      return json({ ok: true, path, signedUrl: full.data.signedUrl, signedUrlSm: thumb.data.signedUrl });
    }

    if (action === 'create') {
      const v = validateAdInput(b);
      if (!v.ok) return json({ ok: false, error: v.error }, 400);
      const path = typeof b.image_path === 'string' ? b.image_path : '';
      const bad = await checkUploadedImages(supabase, path);
      if (bad) return json({ ok: false, error: bad }, 400);
      const { data, error } = await supabase.from('advertisements').insert({ ...v.value, image_path: path }).select('*').single();
      if (error) return json({ ok: false, error: error.message }, 500);
      return json({ ok: true, ad: data });
    }

    const id = typeof b.id === 'string' ? b.id : '';
    if (!UUID_RE.test(id)) return json({ ok: false, error: 'Bad request.' }, 400);
    const { data: row } = await supabase.from('advertisements').select('*').eq('id', id).maybeSingle();
    if (!row) return json({ ok: false, error: 'Advert not found.' }, 404);
    const ad = row as AdRow;
    const now = new Date().toISOString();

    if (action === 'update') {
      const v = validateAdInput(b);
      if (!v.ok) return json({ ok: false, error: v.error }, 400);
      const newPath = typeof b.image_path === 'string' && b.image_path ? b.image_path : null;
      if (newPath && newPath !== ad.image_path) {
        const bad = await checkUploadedImages(supabase, newPath);
        if (bad) return json({ ok: false, error: bad }, 400);
      }
      const { error } = await supabase
        .from('advertisements')
        .update({ ...v.value, image_path: newPath ?? ad.image_path, updated_at: now })
        .eq('id', id);
      if (error) return json({ ok: false, error: error.message }, 500);
      if (newPath && newPath !== ad.image_path) await removeImages(supabase, ad.image_path);
      return json({ ok: true });
    }

    if (action === 'set-active') {
      const { error } = await supabase.from('advertisements').update({ is_active: b.active === true, updated_at: now }).eq('id', id);
      if (error) return json({ ok: false, error: error.message }, 500);
      return json({ ok: true });
    }

    if (action === 'archive') {
      // Archiving also switches the advert off, so restoring it never puts it live by surprise.
      const { error } = await supabase.from('advertisements').update({ archived_at: now, is_active: false, updated_at: now }).eq('id', id);
      if (error) return json({ ok: false, error: error.message }, 500);
      return json({ ok: true });
    }

    if (action === 'restore') {
      const { error } = await supabase.from('advertisements').update({ archived_at: null, updated_at: now }).eq('id', id);
      if (error) return json({ ok: false, error: error.message }, 500);
      return json({ ok: true });
    }

    if (action === 'delete') {
      const { error } = await supabase.from('advertisements').delete().eq('id', id); // its stats go with it (cascade)
      if (error) return json({ ok: false, error: error.message }, 500);
      await removeImages(supabase, ad.image_path);
      return json({ ok: true });
    }

    return json({ ok: false, error: 'Unknown action.' }, 400);
  } catch (err) {
    console.error('admin/ads failed:', action, err);
    return json({ ok: false, error: err instanceof Error ? err.message : 'Something went wrong.' }, 500);
  }
}
