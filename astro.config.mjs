// @ts-check
import { defineConfig } from 'astro/config';
import mdx from '@astrojs/mdx';
import sitemap from '@astrojs/sitemap';
import fs from 'node:fs';
import { satteri } from '@astrojs/markdown-satteri';
import { citationsPlugin } from './src/lib/citations.ts';

// Founders, Companies and Archive are empty (and noindex) until an article is published, so keep them out of the sitemap.
const hasPublishedFiles = fs
  .readdirSync('src/content/files')
  .filter((f) => /\.mdx?$/.test(f))
  .some((f) => !/^draft:\s*true\s*$/m.test(fs.readFileSync(`src/content/files/${f}`, 'utf8')));
const emptyIndexes = ['/founders/', '/companies/', '/archive/'];

export default defineConfig({
  site: 'https://aifounderfiles.com',
  output: 'static',
  trailingSlash: 'always',
  build: { format: 'directory' },
  markdown: { processor: satteri({ mdastPlugins: [citationsPlugin] }) },
  integrations: [
    mdx(),
    sitemap({
      filter: (page) =>
        !page.includes('/subscribed/') &&
        !page.includes('/admin/') &&
        (hasPublishedFiles || !emptyIndexes.some((p) => page.endsWith(p))),
    }),
  ],
});
