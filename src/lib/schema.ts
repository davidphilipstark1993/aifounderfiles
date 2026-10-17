import { SITE } from './site';
import type { AuthorEntry } from './authors';
import { authorAbsoluteUrl } from './authors';
import { fileUrl, type FileEntry } from './files';

const CONTEXT = 'https://schema.org';
const abs = (path: string) => new URL(path, SITE.url).href;

/** The publisher, shared by every page that names one. Matches the home page's Organization. */
export const publisherLd = {
  '@type': 'Organization',
  '@id': `${SITE.url}/#organization`,
  name: SITE.name,
  url: SITE.url,
  logo: { '@type': 'ImageObject', url: abs('/icon-512.png'), width: 512, height: 512 },
};

export const breadcrumbLd = (crumbs: { name: string; path: string }[]) => ({
  '@context': CONTEXT,
  '@type': 'BreadcrumbList',
  itemListElement: crumbs.map((c, i) => ({ '@type': 'ListItem', position: i + 1, name: c.name, item: abs(c.path) })),
});

const isRealYear = (v?: string) => (v && /^\d{4}$/.test(v.trim()) ? v.trim() : undefined);
const isNamed = (v?: string) => (v && !/^undisclosed$/i.test(v.trim()) ? v : undefined);

/** One Person per founder. A file about two founders lists them under `founder.members`. */
export function founderLds(data: FileEntry['data']) {
  const { founder, company } = data;
  const worksFor = { '@type': 'Organization', name: company.name };
  if (founder.members?.length) {
    return founder.members.map((m) => ({
      '@type': 'Person',
      name: m.name,
      ...(m.jobTitle && { jobTitle: m.jobTitle }),
      ...(m.sameAs?.length && { sameAs: m.sameAs }),
      worksFor,
    }));
  }
  const sameAs = [...(founder.linkedin ? [founder.linkedin] : []), ...(founder.sameAs ?? [])];
  return [{ '@type': 'Person', name: founder.name, jobTitle: founder.role, ...(sameAs.length && { sameAs }), worksFor }];
}

export function companyLd(data: FileEntry['data']) {
  const { company } = data;
  const sameAs = [...(company.website ? [company.website] : []), ...(company.sameAs ?? [])];
  return {
    '@type': 'Organization',
    name: company.name,
    ...(company.website && { url: company.website }),
    ...(sameAs.length && { sameAs }),
    ...(isRealYear(company.founded) && { foundingDate: isRealYear(company.founded) }),
    ...(isNamed(company.hq) && { location: { '@type': 'Place', name: company.hq } }),
    founder: founderLds(data).map((p) => ({ '@type': 'Person', name: p.name })),
  };
}

/** Author as a Person (or Organization for a house byline), identified by its author page. */
export function authorLd(author: AuthorEntry) {
  const type = author.data.type === 'person' ? 'Person' : 'Organization';
  const sameAs = Object.values(author.data.sameAs);
  return {
    '@type': type,
    '@id': `${authorAbsoluteUrl(author)}#${author.data.type}`,
    name: author.data.name,
    url: authorAbsoluteUrl(author),
    ...(author.data.jobTitle && { jobTitle: author.data.jobTitle }),
    ...(sameAs.length && { sameAs }),
  };
}

export const profilePageLd = (author: AuthorEntry, photoUrl?: string) => ({
  '@context': CONTEXT,
  '@type': 'ProfilePage',
  url: authorAbsoluteUrl(author),
  name: author.data.name,
  mainEntity: { ...authorLd(author), ...(author.data.bio && { description: author.data.bio }), ...(photoUrl && { image: photoUrl }) },
});

/** A hub page (archive, founders, companies, an author's files): a CollectionPage whose main entity is an ItemList. */
export const collectionPageLd = (opts: { name: string; description: string; path: string; items: { name: string; entry: FileEntry }[] }) => ({
  '@context': CONTEXT,
  '@type': 'CollectionPage',
  name: opts.name,
  description: opts.description,
  url: abs(opts.path),
  isPartOf: { '@id': `${SITE.url}/#website` },
  mainEntity: {
    '@type': 'ItemList',
    numberOfItems: opts.items.length,
    itemListElement: opts.items.map((it, i) => ({ '@type': 'ListItem', position: i + 1, name: it.name, url: abs(fileUrl(it.entry)) })),
  },
});
