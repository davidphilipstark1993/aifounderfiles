// Server-side advert helpers: reading what may be shown, recording events, checking uploaded images.
import type { SupabaseClient } from '@supabase/supabase-js';
import {
  IMAGE_PATH_RE,
  MAX_IMAGE_BYTES,
  isServable,
  smallImagePath,
  type AdRow,
  type PublicAd,
} from './shared.js';

export const AD_BUCKET = 'ads';

export const imageUrl = (supabase: SupabaseClient, path: string) => supabase.storage.from(AD_BUCKET).getPublicUrl(path).data.publicUrl;

export const toPublic = (supabase: SupabaseClient, ad: AdRow): PublicAd => ({
  id: ad.id,
  title: ad.title,
  description: ad.description,
  cta: ad.cta_text,
  alt: ad.image_alt,
  type: ad.ad_type,
  image: imageUrl(supabase, ad.image_path),
  imageSm: imageUrl(supabase, smallImagePath(ad.image_path)),
});

/** Every advert that may be shown right now. The table is small, so filtering by date happens here, in one tested place. */
export async function liveAds(supabase: SupabaseClient, now = new Date()): Promise<AdRow[]> {
  const { data, error } = await supabase.from('advertisements').select('*').eq('is_active', true).is('archived_at', null);
  if (error) throw new Error(error.message);
  return ((data ?? []) as AdRow[]).filter((ad) => isServable(ad, now));
}

export async function recordEvent(supabase: SupabaseClient, adId: string, slot: string, kind: 'impression' | 'click'): Promise<void> {
  const { error } = await supabase.rpc('record_ad_event', { p_ad: adId, p_placement: slot, p_kind: kind });
  if (error) throw new Error(error.message);
}

/**
 * Confirms both WebP files of an upload exist, are small enough and really are WebP (RIFF....WEBP header).
 * Returns an error message, or null when fine.
 */
export async function checkUploadedImages(supabase: SupabaseClient, path: string): Promise<string | null> {
  if (!IMAGE_PATH_RE.test(path)) return 'Invalid image upload.';
  for (const p of [path, smallImagePath(path)]) {
    const { data, error } = await supabase.storage.from(AD_BUCKET).download(p);
    if (error || !data) return 'The image has not finished uploading.';
    if (data.size > MAX_IMAGE_BYTES) return 'The image is over 1 MB after optimising. Try a simpler image.';
    const head = Buffer.from(await data.slice(0, 12).arrayBuffer());
    if (head.length < 12 || head.toString('ascii', 0, 4) !== 'RIFF' || head.toString('ascii', 8, 12) !== 'WEBP') {
      return 'That is not a valid image.';
    }
  }
  return null;
}

export const removeImages = async (supabase: SupabaseClient, path: string) => {
  await supabase.storage.from(AD_BUCKET).remove([path, smallImagePath(path)]);
};
