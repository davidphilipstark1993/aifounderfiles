// @ts-check
import { defineConfig } from 'astro/config';
import mdx from '@astrojs/mdx';
import sitemap from '@astrojs/sitemap';
import fs from 'node:fs';

// Founders, Companies and Archive are empty (and noindex) until an article is published, so keep them out of the sitemap.
const hasPublishedFiles = fs
  .readdirSync('src/content/files')
  .filter((f) => /\.mdx?$/.test(f))
  .some((f) => !/^draft:\s*true\s*$/m.test(fs.readFileSync(`src/content/files/${f}`, 'utf8')));
const emptyIndexes = ['/founders/', '/companies/', '/archive/'];

const blogDir = 'src/content/blog';
const hasPublishedPosts =
  fs.existsSync(blogDir) &&
  fs
    .readdirSync(blogDir)
    .filter((f) => /\.mdx?$/.test(f))
    .some((f) => !/^draft:\s*true\s*$/m.test(fs.readFileSync(`${blogDir}/${f}`, 'utf8')));

// Topic hubs are noindex until they hold HUB_MIN_FILES articles (see src/lib/site.ts), so keep thin ones out of the sitemap too.
const HUB_MIN_FILES = 3;
/** @type {Record<string, number>} */
const pillarCounts = {};
for (const f of fs.readdirSync('src/content/files').filter((f) => /\.mdx?$/.test(f))) {
  const text = fs.readFileSync(`src/content/files/${f}`, 'utf8');
  if (/^draft:\s*true\s*$/m.test(text)) continue;
  const pillar = text.match(/^pillar:\s*"?([\w-]+)"?\s*$/m)?.[1] ?? 'founder-files';
  pillarCounts[pillar] = (pillarCounts[pillar] ?? 0) + 1;
}
/** @param {string} page */
const isThinHub = (page) => {
  const slug = page.match(/\/topics\/([\w-]+)\/$/)?.[1];
  return slug !== undefined && (pillarCounts[slug] ?? 0) < HUB_MIN_FILES;
};

export default defineConfig({
  site: 'https://aifounderfiles.com',
  output: 'static',
  trailingSlash: 'always',
  build: { format: 'directory' },
  integrations: [
    mdx(),
    sitemap({
      filter: (page) =>
        !page.includes('/subscribed/') &&
        !page.includes('/admin/') &&
        !isThinHub(page) &&
        (hasPublishedFiles || !emptyIndexes.some((p) => page.endsWith(p))) &&
        (hasPublishedPosts || !page.endsWith('/blog/')),
    }),
  ],
});
