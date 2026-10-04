// @ts-check
import { defineConfig } from 'astro/config';
import mdx from '@astrojs/mdx';
import sitemap from '@astrojs/sitemap';

export default defineConfig({
  site: 'https://aifounderfiles.com',
  output: 'static',
  trailingSlash: 'always',
  build: { format: 'directory' },
  integrations: [
    mdx(),
    // The privacy page is a noindex placeholder until it has been reviewed, so keep it out of the sitemap.
    sitemap({ filter: (page) => !page.includes('/privacy/') && !page.includes('/subscribed/') && !page.includes('/admin/') }),
  ],
});
