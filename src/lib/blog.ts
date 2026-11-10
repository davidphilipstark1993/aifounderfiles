import { getCollection, type CollectionEntry } from 'astro:content';
import { getPublishedFiles, showDrafts, type FileEntry } from './files';

export type BlogEntry = CollectionEntry<'blog'>;

/**
 * Published blog posts, newest first.
 * Drafts appear in `npm run dev` only (unless PUBLIC_SHOW_DRAFTS=false).
 * Future-dated posts are also withheld from production builds until their publishDate.
 */
export async function getPublishedPosts(): Promise<BlogEntry[]> {
  const now = Date.now();
  const all = await getCollection('blog', ({ data }) => {
    if (data.draft && !showDrafts) return false;
    if (!showDrafts && data.publishDate.getTime() > now) return false;
    return true;
  });
  return all.sort((a, b) => b.data.publishDate.getTime() - a.data.publishDate.getTime());
}

export const blogUrl = (entry: BlogEntry) => `/blog/${entry.id}/`;

/** Resolve optional relatedFiles slugs to published founder files, in the order given. */
export async function resolveRelatedFiles(slugs: string[] | undefined): Promise<FileEntry[]> {
  if (!slugs?.length) return [];
  const files = await getPublishedFiles();
  const byId = new Map(files.map((f) => [f.id, f]));
  return slugs.flatMap((slug) => {
    const entry = byId.get(slug);
    return entry ? [entry] : [];
  });
}
