import rss from '@astrojs/rss';
import type { APIContext } from 'astro';
import { getFileAuthor } from '../lib/authors';
import { fileNumberLabel, fileUrl, getPublishedFiles, notAfterNow } from '../lib/files';
import { SITE } from '../lib/site';

const escapeXml = (s: string) => s.replace(/&/g, '&amp;').replace(/</g, '&lt;').replace(/>/g, '&gt;');

export async function GET(context: APIContext) {
  const files = await getPublishedFiles();
  return rss({
    title: SITE.name,
    description: SITE.description,
    site: context.site!,
    trailingSlash: true,
    items: await Promise.all(files.map(async (f) => ({
      title: `Founder File ${fileNumberLabel(f.data.fileNumber)}: ${f.data.title}`,
      description: f.data.standfirst,
      pubDate: notAfterNow(f.data.publishDate),
      link: fileUrl(f),
      customData: `<dc:creator>${escapeXml((await getFileAuthor(f)).data.name)}</dc:creator>`,
      categories: f.data.tags,
    }))),
    xmlns: { dc: 'http://purl.org/dc/elements/1.1/' },
    customData: '<language>en-gb</language>',
  });
}
