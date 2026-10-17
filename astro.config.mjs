// @ts-check
import { defineConfig } from 'astro/config';
import mdx from '@astrojs/mdx';
import sitemap from '@astrojs/sitemap';
import { satteri } from '@astrojs/markdown-satteri';
import { citationsPlugin } from './src/lib/citations.ts';
import fs from 'node:fs';
import { execFileSync } from 'node:child_process';
import matter from 'gray-matter';

// Published files (drafts are excluded from production builds).
const files = fs
  .readdirSync('src/content/files')
  .filter((f) => /\.mdx?$/.test(f))
  .map((f) => ({ id: f.replace(/\.mdx?$/, ''), path: `src/content/files/${f}`, ...matter(fs.readFileSync(`src/content/files/${f}`, 'utf8')) }))
  .filter((f) => !f.data.draft);

// Founders, Companies and Archive are empty (and noindex) until an article is published, so keep them out of the sitemap.
const hasPublishedFiles = files.length > 0;
const emptyIndexes = ['/founders/', '/companies/', '/archive/'];

// <lastmod> for the sitemap: a file's updatedDate, else its publishDate. Never in the future. An early read
// (dated in the future) falls back to the last git commit that touched it, or no lastmod.
const now = new Date();
function gitDate(path) {
  try {
    const out = execFileSync('git', ['log', '-1', '--format=%cI', '--', path], { encoding: 'utf8' }).trim();
    return out ? new Date(out) : undefined;
  } catch {
    return undefined;
  }
}
const fileLastmod = (f) => {
  const d = new Date(f.data.updatedDate ?? f.data.publishDate);
  return d > now ? gitDate(f.path) : d;
};
const newest = (dates) => dates.filter(Boolean).sort((a, b) => b.getTime() - a.getTime())[0];

/** @type {Map<string, Date | undefined>} */
const lastmod = new Map();
for (const f of files) lastmod.set(`/files/${f.id}/`, fileLastmod(f));
const allDates = files.map(fileLastmod);
for (const hub of ['/', '/archive/', '/founders/', '/companies/']) lastmod.set(hub, newest(allDates));
for (const author of new Set(files.map((f) => String(f.data.author)))) {
  lastmod.set(`/authors/${author}/`, newest(files.filter((f) => String(f.data.author) === author).map(fileLastmod)));
}

export default defineConfig({
  site: 'https://aifounderfiles.com',
  output: 'static',
  trailingSlash: 'always',
  build: { format: 'directory' },
  // [^n] citation markers in articles (see src/lib/citations.ts)
  markdown: { processor: satteri({ mdastPlugins: [citationsPlugin] }) },
  integrations: [
    mdx(),
    sitemap({
      filter: (page) =>
        !page.includes('/subscribed/') &&
        !page.includes('/admin/') &&
        (hasPublishedFiles || !emptyIndexes.some((p) => page.endsWith(p))),
      serialize(item) {
        const date = lastmod.get(new URL(item.url).pathname);
        if (date) item.lastmod = date.toISOString();
        return item;
      },
    }),
  ],
});
