import rss from '@astrojs/rss';
import type { APIContext } from 'astro';
import { fileNumberLabel, fileUrl, getPublishedFiles, notAfterNow } from '../lib/files';
import { blogUrl, getPublishedPosts } from '../lib/blog';
import { SITE } from '../lib/site';

const escapeXml = (s: string) => s.replace(/&/g, '&amp;').replace(/</g, '&lt;').replace(/>/g, '&gt;');

export async function GET(context: APIContext) {
  const files = await getPublishedFiles();
  const posts = await getPublishedPosts();
  const items = [
    ...files.map((f) => ({
      title: `Founder File ${fileNumberLabel(f.data.fileNumber)}: ${f.data.title}`,
      description: f.data.standfirst,
      pubDate: notAfterNow(f.data.publishDate),
      link: fileUrl(f),
      customData: `<dc:creator>${escapeXml(f.data.author)}</dc:creator>`,
      categories: f.data.tags,
    })),
    ...posts.map((p) => ({
      title: p.data.title,
      description: p.data.description,
      pubDate: notAfterNow(p.data.publishDate),
      link: blogUrl(p),
      customData: `<dc:creator>${escapeXml(p.data.author)}</dc:creator>`,
      categories: p.data.tags,
    })),
  ].sort((a, b) => b.pubDate.getTime() - a.pubDate.getTime());

  return rss({
    title: SITE.name,
    description: SITE.description,
    site: context.site!,
    trailingSlash: true,
    items,
    xmlns: { dc: 'http://purl.org/dc/elements/1.1/' },
    customData: '<language>en-gb</language>',
  });
}
