// Advertising rules shared by the Vercel functions (lib/ads/store.ts, api/*.ts) and the browser
// (admin page, ad slots). No Node or Supabase imports here: this file ships to the browser.

export const SITE_UTM_SOURCE = 'aifounderfiles';

export interface Placement {
  key: string;
  label: string;
  /** Where it appears, shown in the admin form. */
  where: string;
  /** Layout used for this placement on the site and in the admin preview. */
  layout: AdLayout;
  /** Most adverts shown at once in this slot. */
  max: number;
}
export type AdLayout = 'grid' | 'feature' | 'compact';

export const PLACEMENTS: readonly Placement[] = [
  { key: 'home-promo', label: 'Homepage promotional section', where: 'Home page, above the newsletter sign-up band', layout: 'grid', max: 3 },
  { key: 'home-between', label: 'Homepage, between editorial sections', where: 'Home page, between the sample issue and the file lists', layout: 'feature', max: 1 },
  { key: 'founder-page', label: 'Founder research pages', where: 'End of each Founder Files article', layout: 'feature', max: 1 },
  { key: 'company-page', label: 'AI company profiles', where: 'End of each Company Files article', layout: 'feature', max: 1 },
  { key: 'article', label: 'Blog and article pages', where: 'End of How They Built It and Business Models articles', layout: 'feature', max: 1 },
  { key: 'newsletter', label: 'Newsletter pages', where: 'Subscribe page and Archive page', layout: 'feature', max: 1 },
  { key: 'subscribed', label: 'Newsletter confirmation page', where: 'The “You’re on the list” page', layout: 'feature', max: 1 },
] as const;

/** Slot used on every page that has no placement of its own. Only site-wide adverts fill it. */
export const SITEWIDE_SLOT: Placement = {
  key: 'sitewide',
  label: 'Site-wide strip',
  where: 'Above the footer on pages without a placement of their own',
  layout: 'compact',
  max: 1,
};

export const PLACEMENT_KEYS: readonly string[] = PLACEMENTS.map((p) => p.key);
export const SLOT_KEYS: readonly string[] = [...PLACEMENT_KEYS, SITEWIDE_SLOT.key];
export const placementLabel = (key: string) => [...PLACEMENTS, SITEWIDE_SLOT].find((p) => p.key === key)?.label ?? key;
export const slotConfig = (key: string): Placement | undefined => [...PLACEMENTS, SITEWIDE_SLOT].find((p) => p.key === key);

/** Which placement an article page uses, from its editorial pillar. */
export function placementForPillar(pillar: string): string {
  if (pillar === 'founder-files') return 'founder-page';
  if (pillar === 'company-files') return 'company-page';
  return 'article';
}

export type AdType = 'house' | 'partner' | 'sponsored';
export const AD_TYPES: readonly { key: AdType; label: string; label_public: string; hint: string }[] = [
  { key: 'house', label: 'My own site', label_public: 'Also from us', hint: 'AI Founder Files’ sister sites, such as Listen True Crime.' },
  { key: 'partner', label: 'Recommended resource', label_public: 'Recommended', hint: 'A tool, newsletter or company you recommend, unpaid.' },
  { key: 'sponsored', label: 'Paid sponsor', label_public: 'Sponsored', hint: 'Anyone paying for the slot. Labelled “Sponsored” and tagged rel=sponsored.' },
] as const;
export const publicLabel = (t: string) => AD_TYPES.find((a) => a.key === t)?.label_public ?? 'Recommended';

/** What the database stores for one advert. */
export interface AdRow {
  id: string;
  title: string;
  description: string;
  destination_url: string;
  cta_text: string;
  image_path: string;
  image_alt: string;
  ad_type: AdType;
  placements: string[];
  site_wide: boolean;
  starts_at: string | null;
  ends_at: string | null;
  is_active: boolean;
  priority: number;
  utm_campaign: string | null;
  archived_at: string | null;
  created_at: string;
  updated_at: string;
}

/** What visitors' browsers receive: no scheduling or admin fields. */
export interface PublicAd {
  id: string;
  title: string;
  description: string;
  cta: string;
  alt: string;
  type: AdType;
  image: string;
  imageSm: string;
}

export type AdStatus = 'live' | 'scheduled' | 'expired' | 'inactive' | 'archived';

export function adStatus(ad: Pick<AdRow, 'is_active' | 'archived_at' | 'starts_at' | 'ends_at'>, now = new Date()): AdStatus {
  if (ad.archived_at) return 'archived';
  if (!ad.is_active) return 'inactive';
  if (ad.ends_at && new Date(ad.ends_at) <= now) return 'expired';
  if (ad.starts_at && new Date(ad.starts_at) > now) return 'scheduled';
  return 'live';
}

export const isServable = (ad: AdRow, now = new Date()) => adStatus(ad, now) === 'live';

/** Is this advert allowed in this slot? Site-wide adverts fit any slot; the sitewide slot takes only those. */
export const fitsSlot = (ad: Pick<AdRow, 'placements' | 'site_wide'>, slot: string) =>
  ad.site_wide || (slot !== SITEWIDE_SLOT.key && ad.placements.includes(slot));

/** Highest priority first; adverts with equal priority are shuffled so they take turns. */
export function pickAds<T extends Pick<AdRow, 'priority' | 'placements' | 'site_wide'>>(
  ads: T[],
  slot: string,
  limit: number,
  random: () => number = Math.random,
): T[] {
  const pool = ads.filter((a) => fitsSlot(a, slot));
  const keyed = pool.map((a) => ({ a, r: random() }));
  keyed.sort((x, y) => y.a.priority - x.a.priority || x.r - y.r);
  return keyed.slice(0, limit).map((k) => k.a);
}

export const slugify = (s: string) =>
  s
    .toLowerCase()
    .normalize('NFKD')
    .replace(/[̀-ͯ]/g, '')
    .replace(/[^a-z0-9]+/g, '-')
    .replace(/^-+|-+$/g, '')
    .slice(0, 50);

const MEDIUM: Record<AdType, string> = { house: 'cross_promo', partner: 'referral', sponsored: 'sponsored' };

/**
 * The URL a visitor lands on: the saved destination plus source-specific UTM parameters.
 *   utm_source   aifounderfiles
 *   utm_medium   cross_promo (my sites) | referral (recommended) | sponsored (paid)
 *   utm_campaign the advert's campaign name, else a slug of its title
 *   utm_content  the placement that was clicked
 * Parameters already present in the saved URL are never overwritten.
 */
export function destinationWithUtm(ad: Pick<AdRow, 'destination_url' | 'ad_type' | 'utm_campaign' | 'title'>, slot: string): string {
  const url = new URL(ad.destination_url);
  const add = (k: string, v: string) => {
    if (v && !url.searchParams.has(k)) url.searchParams.set(k, v);
  };
  add('utm_source', SITE_UTM_SOURCE);
  add('utm_medium', MEDIUM[ad.ad_type] ?? 'referral');
  add('utm_campaign', ad.utm_campaign || slugify(ad.title));
  add('utm_content', slot);
  return url.toString();
}

/** Layout of the card in the admin preview and on the site. */
export const layoutFor = (slot: string): AdLayout => slotConfig(slot)?.layout ?? 'feature';

// ---------- Image paths ----------
// An upload is two WebP files under one random folder: <uuid>/<token>-1280.webp (16:9, 1280×720)
// and <uuid>/<token>-640.webp (640×360, for phones). The row stores the 1280 path.
export const IMAGE_PATH_RE = /^[0-9a-f-]{36}\/[a-z0-9]{8,32}-1280\.webp$/;
export const smallImagePath = (path: string) => path.replace(/-1280\.webp$/, '-640.webp');
export const MAX_IMAGE_BYTES = 1024 * 1024;

// ---------- Validation (used by the admin API; the admin form mirrors the limits) ----------
export interface AdInput {
  title: string;
  description: string;
  destination_url: string;
  cta_text: string;
  image_alt: string;
  ad_type: AdType;
  placements: string[];
  site_wide: boolean;
  starts_at: string | null;
  ends_at: string | null;
  is_active: boolean;
  priority: number;
  utm_campaign: string | null;
}

const str = (v: unknown) => (typeof v === 'string' ? v.trim() : '');

function dateOrNull(v: unknown): string | null | undefined {
  if (v === null || v === undefined || v === '') return null;
  if (typeof v !== 'string') return undefined;
  const t = Date.parse(v);
  return Number.isNaN(t) ? undefined : new Date(t).toISOString();
}

export function validateAdInput(b: Record<string, unknown>): { ok: true; value: AdInput } | { ok: false; error: string } {
  const title = str(b.title);
  if (!title || title.length > 90) return { ok: false, error: 'Add a title (up to 90 characters).' };

  const description = str(b.description);
  if (description.length > 220) return { ok: false, error: 'The description is too long (220 characters max).' };

  const destination = str(b.destination_url);
  let parsed: URL;
  try {
    parsed = new URL(destination);
  } catch {
    return { ok: false, error: 'The destination URL is not a valid web address. Include https://.' };
  }
  if (!/^https?:$/.test(parsed.protocol) || parsed.username || parsed.password || destination.length > 1000) {
    return { ok: false, error: 'The destination must be a plain http(s) web address.' };
  }

  const cta = str(b.cta_text) || 'Read more';
  if (cta.length > 28) return { ok: false, error: 'Button text is too long (28 characters max).' };

  const alt = str(b.image_alt);
  if (!alt || alt.length > 200) return { ok: false, error: 'Add image alt text (up to 200 characters).' };

  const type = str(b.ad_type) || 'house';
  if (!AD_TYPES.some((t) => t.key === type)) return { ok: false, error: 'Unknown advert type.' };

  const rawPlacements = Array.isArray(b.placements) ? b.placements : [];
  const placements = [...new Set(rawPlacements.filter((p): p is string => typeof p === 'string'))];
  if (placements.some((p) => !PLACEMENT_KEYS.includes(p))) return { ok: false, error: 'Unknown placement.' };
  const siteWide = b.site_wide === true;
  if (!siteWide && placements.length === 0) return { ok: false, error: 'Choose at least one placement, or tick site-wide.' };

  const starts = dateOrNull(b.starts_at);
  const ends = dateOrNull(b.ends_at);
  if (starts === undefined || ends === undefined) return { ok: false, error: 'A date is not valid.' };
  if (starts && ends && Date.parse(ends) <= Date.parse(starts)) return { ok: false, error: 'The end date must be after the start date.' };

  const priority = Number(b.priority ?? 0);
  if (!Number.isInteger(priority) || priority < 0 || priority > 100) return { ok: false, error: 'Priority must be a whole number from 0 to 100.' };

  const campaignRaw = str(b.utm_campaign);
  const campaign = campaignRaw ? slugify(campaignRaw) : null;
  if (campaignRaw && !campaign) return { ok: false, error: 'The campaign name needs letters or numbers.' };

  return {
    ok: true,
    value: {
      title,
      description,
      destination_url: parsed.href,
      cta_text: cta,
      image_alt: alt,
      ad_type: type as AdType,
      placements,
      site_wide: siteWide,
      starts_at: starts,
      ends_at: ends,
      is_active: b.is_active === true,
      priority,
      utm_campaign: campaign,
    },
  };
}

const BOT_RE = /bot|crawl|spider|slurp|preview|facebookexternalhit|headless|lighthouse|pingdom|uptime|monitor|curl|wget|python|axios|node-fetch|go-http|java\//i;
/** Requests with no or robotic user agents are not counted. */
export const looksLikeBot = (userAgent: string | null) => !userAgent || BOT_RE.test(userAgent);

export const ctr = (impressions: number, clicks: number) => (impressions > 0 ? clicks / impressions : 0);
