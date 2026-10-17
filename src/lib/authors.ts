import { getCollection, getEntry, type CollectionEntry } from 'astro:content';
import { SITE } from './site';
import type { FileEntry } from './files';

export type AuthorEntry = CollectionEntry<'authors'>;

export const authorUrl = (author: AuthorEntry) => `/authors/${author.id}/`;
export const authorAbsoluteUrl = (author: AuthorEntry) => new URL(authorUrl(author), SITE.url).href;

export async function getAuthors(): Promise<AuthorEntry[]> {
  const all = await getCollection('authors');
  return all.sort((a, b) => a.data.name.localeCompare(b.data.name, 'en-GB'));
}

/** The author a file points at. The build fails if the slug has no matching file in src/content/authors. */
export async function getFileAuthor(file: FileEntry): Promise<AuthorEntry> {
  const author = await getEntry(file.data.author);
  if (!author) throw new Error(`${file.id}: author "${file.data.author.id}" not found in src/content/authors`);
  return author;
}

/** Profile links, in a stable order. */
export function authorLinks(author: AuthorEntry): { label: string; href: string }[] {
  const { linkedin, x } = author.data.sameAs;
  return [
    ...(linkedin ? [{ label: 'LinkedIn', href: linkedin }] : []),
    ...(x ? [{ label: 'X', href: x }] : []),
  ];
}
