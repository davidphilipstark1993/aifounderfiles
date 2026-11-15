// Checks the built site (dist/) for search basics. Run after `npm run build`: `npm run check:seo`.
// Fails on: missing/duplicate titles or descriptions, titles over 60 or descriptions over 155 characters,
// a missing or non-self-referencing canonical, anything other than one <h1>, missing Open Graph/Twitter tags,
// JSON-LD that doesn't parse, and indexable pages missing from the sitemap (or noindex pages in it).
import fs from 'node:fs';
import path from 'node:path';

const SITE = 'https://aifounderfiles.com';
const DIST = 'dist';
const decode = (s) =>
  s.replace(/&amp;/g, '&').replace(/&quot;/g, '"').replace(/&#39;|&#x27;/g, "'").replace(/&lt;/g, '<').replace(/&gt;/g, '>');
const meta = (html, attr, key) =>
  html.match(new RegExp(`<meta ${attr}="${key}" content="([^"]*)"`))?.[1];

const pages = [];
(function walk(dir) {
  for (const f of fs.readdirSync(dir, { withFileTypes: true })) {
    const p = path.join(dir, f.name);
    if (f.isDirectory()) walk(p);
    else if (f.name === 'index.html') pages.push(p);
  }
})(DIST);

const sitemap = new Set(
  fs
    .readdirSync(DIST)
    .filter((f) => /^sitemap-\d+\.xml$/.test(f))
    .flatMap((f) => [...fs.readFileSync(path.join(DIST, f), 'utf8').matchAll(/<loc>([^<]+)<\/loc>/g)].map((m) => m[1])),
);

const errors = [];
const seen = { title: new Map(), description: new Map() };
const rows = [];
for (const file of pages.sort()) {
  const html = fs.readFileSync(file, 'utf8');
  const urlPath = ('/' + path.relative(DIST, path.dirname(file)).split(path.sep).join('/') + '/').replace(/\/+/g, '/');
  const url = new URL(urlPath, SITE).href;
  const err = (m) => errors.push(`${urlPath}: ${m}`);
  const noindex = /<meta name="robots" content="[^"]*noindex/.test(html);

  const title = decode(html.match(/<title>([^<]*)<\/title>/)?.[1] ?? '');
  const description = decode(meta(html, 'name', 'description') ?? '');
  const canonical = html.match(/<link rel="canonical" href="([^"]*)"/)?.[1];
  const h1s = html.match(/<h1[\s>]/g)?.length ?? 0;
  rows.push({ path: urlPath, noindex, title, description });

  if (!title) err('no <title>');
  if (!description) err('no meta description');
  if (!noindex) {
    if (title.length > 60) err(`title is ${title.length} characters: ${title}`);
    if (description.length > 155) err(`description is ${description.length} characters`);
    for (const [k, v] of [['title', title], ['description', description]]) {
      if (seen[k].has(v)) err(`duplicate ${k} (also on ${seen[k].get(v)})`);
      else seen[k].set(v, urlPath);
    }
    if (!sitemap.has(url)) err('indexable but not in the sitemap');
  } else if (sitemap.has(url)) err('noindex but listed in the sitemap');
  if (canonical !== url) err(`canonical is ${canonical}, expected ${url}`);
  if (h1s !== 1) err(`${h1s} <h1> elements`);
  for (const k of ['og:title', 'og:description', 'og:url', 'og:image', 'og:type']) if (!meta(html, 'property', k)) err(`no ${k}`);
  for (const k of ['twitter:card', 'twitter:title', 'twitter:description', 'twitter:image']) if (!meta(html, 'name', k)) err(`no ${k}`);
  for (const m of html.matchAll(/<script type="application\/ld\+json">([\s\S]*?)<\/script>/g)) {
    try {
      JSON.parse(m[1]);
    } catch (e) {
      err(`JSON-LD does not parse: ${e.message}`);
    }
  }
}
for (const u of sitemap) {
  const p = path.join(DIST, new URL(u).pathname, 'index.html');
  if (!fs.existsSync(p)) errors.push(`sitemap lists ${u}, which was not built`);
}

if (process.argv.includes('--table')) {
  for (const r of rows) console.log(`${r.path}\t${r.noindex ? 'noindex' : 'index'}\t${r.title.length}\t${r.title}\t${r.description.length}\t${r.description}`);
}
console.log(`${pages.length} pages checked, ${sitemap.size} URLs in the sitemap.`);
if (errors.length) {
  console.error(errors.map((e) => `  ✗ ${e}`).join('\n'));
  process.exit(1);
}
console.log('  ✓ No problems found.');
