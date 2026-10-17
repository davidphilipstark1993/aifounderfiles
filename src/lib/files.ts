import { getCollection, type CollectionEntry } from 'astro:content';

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

/**
 * The names a file's founder and company go by in other files' text, e.g. "Dario and Daniela Amodei"
 * -> Dario Amodei, Daniela Amodei, Amodei, Amodeis.
 */
export function entityAliases(data: FileEntry['data']): { founder: string[]; company: string[] } {
  const parts = data.founder.name.split(/\s+and\s+/);
  const surname = parts.at(-1)!.split(' ').slice(1).pop();
  const founder = new Set<string>();
  parts.forEach((p, i) => founder.add(i < parts.length - 1 && !p.includes(' ') && surname ? `${p} ${surname}` : p));
  if (parts.length > 1 && surname) [surname, `${surname}s`].forEach((s) => founder.add(s));
  return { founder: [...founder], company: [data.company.name] };
}

const escapeRe = (s: string) => s.replace(/[.*+?^${}()|[\]\\]/g, '\\$&');

/** Other files whose text names one of `aliases`. */
function mentionedIn(aliases: string[], own: FileEntry[], all: FileEntry[]) {
  const re = new RegExp(`\\b(?:${aliases.map(escapeRe).join('|')})\\b`);
  return all.filter((f) => !own.includes(f) && re.test(f.body ?? ''));
}

export type Founder = {
  name: string;
  role: string;
  company: string;
  /** The newest file about them. */
  entry: FileEntry;
  /** Every file about them, newest first. */
  entries: FileEntry[];
  /** Other files that name them in the text. */
  mentionedIn: FileEntry[];
};
export type Company = FileEntry['data']['company'] & {
  founder: string;
  entry: FileEntry;
  entries: FileEntry[];
  mentionedIn: FileEntry[];
};

/** One row per founder, with every file they are the subject of. */
export async function getFounders(): Promise<Founder[]> {
  const all = await getPublishedFiles();
  const groups = new Map<string, FileEntry[]>();
  for (const entry of all) {
    const key = slugify(entry.data.founder.name);
    groups.set(key, [...(groups.get(key) ?? []), entry]);
  }
  return [...groups.values()]
    .map((entries) => {
      const [entry] = entries; // newest first
      return {
        name: entry.data.founder.name,
        role: entry.data.founder.role,
        company: entry.data.company.name,
        entry,
        entries,
        mentionedIn: mentionedIn(entityAliases(entry.data).founder, entries, all),
      };
    })
    .sort((a, b) => a.name.localeCompare(b.name, 'en-GB'));
}

export async function getCompanies(): Promise<Company[]> {
  const all = await getPublishedFiles();
  const groups = new Map<string, FileEntry[]>();
  for (const entry of all) {
    const key = slugify(entry.data.company.name);
    groups.set(key, [...(groups.get(key) ?? []), entry]);
  }
  return [...groups.values()]
    .map((entries) => {
      const [entry] = entries;
      return {
        ...entry.data.company,
        founder: entry.data.founder.name,
        entry,
        entries,
        mentionedIn: mentionedIn(entityAliases(entry.data).company, entries, all),
      };
    })
    .sort((a, b) => a.name.localeCompare(b.name, 'en-GB'));
}

/** Files about the same company or founder first, then files that share tags or a sector, topped up with the newest others. */
export function relatedFiles(current: FileEntry, all: FileEntry[], count = 3): FileEntry[] {
  const others = all.filter((f) => f.id !== current.id);
  const score = (f: FileEntry) =>
    f.data.tags.filter((t) => current.data.tags.includes(t)).length +
    (f.data.company.sector === current.data.company.sector ? 2 : 0) +
    (slugify(f.data.company.name) === slugify(current.data.company.name) ? 6 : 0) +
    (slugify(f.data.founder.name) === slugify(current.data.founder.name) ? 6 : 0);
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
