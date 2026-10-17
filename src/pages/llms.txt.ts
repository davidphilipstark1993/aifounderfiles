import type { APIRoute } from 'astro';
import { getAuthors, authorUrl } from '../lib/authors';
import { fileNumberLabel, fileUrl, getPublishedFiles } from '../lib/files';
import { SITE } from '../lib/site';

const abs = (path: string) => new URL(path, SITE.url).href;

/** /llms.txt: a plain-text map of the site for language models and answer engines (https://llmstxt.org). */
export const GET: APIRoute = async () => {
  const files = await getPublishedFiles();
  const authors = await getAuthors();

  const lines = [
    `# ${SITE.name}`,
    '',
    `> ${SITE.description}`,
    '',
    `${SITE.name} publishes one Founder File a week: a long, sourced profile of one AI founder and their company. Each file has a fact box (founder, company, founded, HQ, sector, stage, funding), numbered inline citations that link to a Sources list at the end, a Quick answers section where present, and a published and updated date. Figures are in US dollars unless stated. The site is written in British English.`,
    '',
    '## Editorial policy in brief',
    '',
    '- Coverage is never paid for. No company, founder, investor or agency can pay to be featured or to influence a file.',
    '- Sponsored content, if it is ever published, is labelled and kept separate from Founder Files.',
    '- A company that has paid us in the last 12 months is not eligible for coverage.',
    '- Primary sources come first. Every figure and factual claim is traced to a source listed at the end of the file; figures that cannot be verified are called undisclosed or unverified.',
    `- Corrections: email ${SITE.correctionsEmail}. A corrected file gets a new "Updated" date.`,
    `- Full policy: ${abs('/editorial-policy/')}`,
    '',
    '## Founder Files',
    '',
    ...files.map(
      (f) => `- [${f.data.title}](${abs(fileUrl(f))}): Founder File ${fileNumberLabel(f.data.fileNumber)}, ${f.data.founder.name} and ${f.data.company.name}. ${f.data.description ?? f.data.standfirst}`,
    ),
    '',
    '## Hubs',
    '',
    `- [All files](${abs('/archive/')}): every Founder File, newest first`,
    `- [Founders](${abs('/founders/')}): every founder profiled, with every file they appear in`,
    `- [Companies](${abs('/companies/')}): every company profiled, with every file it appears in`,
    ...authors.map((a) => `- [${a.data.name}](${abs(authorUrl(a))}): author page`),
    '',
    '## About',
    '',
    `- [About](${abs('/about/')})`,
    `- [Editorial policy](${abs('/editorial-policy/')})`,
    `- [RSS feed, with full text](${abs('/rss.xml')})`,
    `- [Sitemap](${abs('/sitemap-index.xml')})`,
    '',
  ];

  return new Response(lines.join('\n'), { headers: { 'Content-Type': 'text/plain; charset=utf-8' } });
};
