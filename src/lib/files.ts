import { getCollection, type CollectionEntry } from 'astro:content';
import { PILLARS } from './site';

export type FileEntry = CollectionEntry<'files'>;

/** Drafts show in `npm run dev` only (set PUBLIC_SHOW_DRAFTS=false to hide them there too). */
export const showDrafts = import.meta.env.DEV && import.meta.env.PUBLIC_SHOW_DRAFTS !== 'false';

export async function getPublishedFiles(): Promise<FileEntry[]> {
  const all = await getCollection('files', ({ data }) => showDrafts || !data.draft);
  return all.sort(
    (a, b) =>
      b.data.publishDate.getTime() - a.data.publishDate.getTime() ||
      b.data.fileNumber - a.data.fileNumber,
  );
}

/**
 * An "early read": published on the site before its issue date (the Sunday it goes out to subscribers).
 * Upcoming files are listed under "Coming up", never featured as this week's file.
 */
export const isUpcoming = (entry: FileEntry, now = new Date()) => entry.data.publishDate.getTime() > now.getTime();

/** For machine-readable dates (JSON-LD, RSS, meta): a date is never in the future. */
export const notAfterNow = (d: Date, now = new Date()) => (d.getTime() > now.getTime() ? now : d);

/** The "Who" and "What" bullets of a file's "The short version" section, as plain text. Missing if the file has no such section. */
export function shortVersion(entry: FileEntry): { who?: string; what?: string } {
  const lines = (entry.body ?? '').split('\n');
  const start = lines.findIndex((l) => /^##\s+The short version\s*$/.test(l));
  if (start === -1) return {};
  const end = lines.findIndex((l, i) => i > start && /^##\s/.test(l));
  const bullets = lines.slice(start + 1, end === -1 ? undefined : end);
  const plain = (s: string) => s.replace(/\[([^\]]+)\]\([^)]*\)/g, '$1').replace(/\*\*/g, '').trim();
  const pick = (label: string) => {
    const line = bullets.find((l) => l.startsWith(`- **${label}:**`));
    return line ? plain(line.replace(`- **${label}:**`, '')) : undefined;
  };
  return { who: pick('Who'), what: pick('What') };
}

export const fileNumberLabel = (n: number) => `#${String(n).padStart(3, '0')}`;

export const fileUrl = (entry: FileEntry) => `/files/${entry.id}/`;

export function readingTime(body = ''): number {
  const words = body
    .replace(/```[\s\S]*?```/g, ' ')
    .replace(/<[^>]+>/g, ' ')
    .split(/\s+/)
    .filter(Boolean).length;
  return Math.max(1, Math.ceil(words / 230));
}

export function formatDate(date: Date, style: 'long' | 'short' = 'long'): string {
  return new Intl.DateTimeFormat('en-GB', {
    day: 'numeric',
    month: style === 'long' ? 'long' : 'short',
    year: 'numeric',
    timeZone: 'UTC',
  }).format(date);
}

export const isoDate = (d: Date) => d.toISOString().slice(0, 10);

export const slugify = (s: string) =>
  s
    .toLowerCase()
    .normalize('NFKD')
    .replace(/[^a-z0-9]+/g, '-')
    .replace(/^-|-$/g, '');

export type Founder = { name: string; role: string; company: string; entry: FileEntry };
export type Company = FileEntry['data']['company'] & { founder: string; entry: FileEntry };

/** One row per founder. If a founder is covered twice, the newest file wins. */
export async function getFounders(): Promise<Founder[]> {
  const seen = new Map<string, Founder>();
  for (const entry of await getPublishedFiles()) {
    const key = slugify(entry.data.founder.name);
    if (!seen.has(key)) {
      seen.set(key, {
        name: entry.data.founder.name,
        role: entry.data.founder.role,
        company: entry.data.company.name,
        entry,
      });
    }
  }
  return [...seen.values()].sort((a, b) => a.name.localeCompare(b.name, 'en-GB'));
}

export async function getCompanies(): Promise<Company[]> {
  const seen = new Map<string, Company>();
  for (const entry of await getPublishedFiles()) {
    const key = slugify(entry.data.company.name);
    if (!seen.has(key)) seen.set(key, { ...entry.data.company, founder: entry.data.founder.name, entry });
  }
  return [...seen.values()].sort((a, b) => a.name.localeCompare(b.name, 'en-GB'));
}

/** Files that share tags or a sector with `current`, topped up with the newest others. */
export function relatedFiles(current: FileEntry, all: FileEntry[], count = 3): FileEntry[] {
  const others = all.filter((f) => f.id !== current.id);
  const score = (f: FileEntry) =>
    f.data.tags.filter((t) => current.data.tags.includes(t)).length +
    (f.data.company.sector === current.data.company.sector ? 2 : 0);
  return others
    .map((f, i) => ({ f, s: score(f), i }))
    .sort((a, b) => b.s - a.s || a.i - b.i)
    .slice(0, count)
    .map((x) => x.f);
}

export type FactField = { label: string; value: string };

/** Rows for the manila "THE FILE" box. Missing optional fields read "Undisclosed". */
export function factFields(data: FileEntry['data'], compact = false): FactField[] {
  const c = data.company;
  const u = (v?: string) => (v && v.trim() ? v : 'Undisclosed');
  const rows: FactField[] = [
    { label: 'Founder', value: data.founder.name },
    { label: 'Company', value: c.name },
    { label: 'Founded', value: u(c.founded) },
    { label: 'HQ', value: u(c.hq) },
    { label: 'Sector', value: c.sector },
  ];
  if (!compact) rows.push({ label: 'Stage', value: u(c.stage) });
  rows.push({ label: 'Funding', value: u(c.funding) });
  if (!compact && c.businessModel) rows.push({ label: 'Model', value: c.businessModel });
  return rows;
}

export const pillarOf = (entry: FileEntry) => PILLARS.find((p) => p.slug === entry.data.pillar) ?? PILLARS[0];

export async function getFilesByPillar(slug: string): Promise<FileEntry[]> {
  return (await getPublishedFiles()).filter((f) => f.data.pillar === slug);
}
