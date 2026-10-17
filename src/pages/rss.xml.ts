import rss from '@astrojs/rss';
import type { APIContext } from 'astro';
import { experimental_AstroContainer as AstroContainer } from 'astro/container';
import { render } from 'astro:content';
import { getFileAuthor } from '../lib/authors';
import { fileNumberLabel, fileUrl, getPublishedFiles, notAfterNow, type FileEntry } from '../lib/files';
import { SITE } from '../lib/site';

const escapeXml = (s: string) => s.replace(/&/g, '&amp;').replace(/</g, '&lt;').replace(/>/g, '&gt;');

/** The article body as HTML for feed readers, with in-page and root-relative links made absolute. */
async function articleHtml(container: AstroContainer, entry: FileEntry) {
  const { Content } = await render(entry);
  const page = new URL(fileUrl(entry), SITE.url).href;
  return (await container.renderToString(Content))
    .replace(/⁠/g, '')
    .replace(/ (?:data-astro-cid-[\w-]+)(?:="")?/g, '')
    .replace(/href="#/g, `href="${page}#`)
    .replace(/(href|src)="\/(?!\/)/g, `$1="${SITE.url}/`);
}

export async function GET(context: APIContext) {
  const files = await getPublishedFiles();
  const container = await AstroContainer.create();
  return rss({
    title: SITE.name,
    description: SITE.description,
    site: context.site!,
    trailingSlash: true,
    items: await Promise.all(
      files.map(async (f) => ({
        title: `Founder File ${fileNumberLabel(f.data.fileNumber)}: ${f.data.title}`,
        description: f.data.standfirst,
        content: await articleHtml(container, f),
        pubDate: notAfterNow(f.data.publishDate),
        link: fileUrl(f),
        customData: `<dc:creator>${escapeXml((await getFileAuthor(f)).data.name)}</dc:creator>`,
        categories: f.data.tags,
      })),
    ),
    xmlns: { dc: 'http://purl.org/dc/elements/1.1/', content: 'http://purl.org/rss/1.0/modules/content/' },
    customData: '<language>en-gb</language>',
  });
}
