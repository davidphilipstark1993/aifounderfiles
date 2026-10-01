// Generates favicon.svg, PNG favicons, the web manifest and the default OG image into /public.
// Run with:  npm run brand
// All text is converted to paths first, so none of these files depend on a font.
import fs from 'node:fs';
import path from 'node:path';
import { Resvg } from '@resvg/resvg-js';
import { THEMES, markInner, outline } from './lib/outline.mjs';

const PUBLIC = path.join(process.cwd(), 'public');
const INK = '#0E1A2B';
const PAPER = '#F7F5F0';
const SIGNAL_LIGHT = '#F06A3F';
const INK_MUTED = '#AEB6C2';

const write = (name, data) => {
  fs.writeFileSync(path.join(PUBLIC, name), data);
  console.log('wrote public/' + name);
};
const png = (svg, width) => new Resvg(svg, { fitTo: { mode: 'width', value: width } }).render().asPng();

// ---- favicon.svg (square canvas, adapts to dark browser chrome) ----
const L = THEMES.light;
const D = THEMES.dark;
const inner = markInner({ body: 'BODY', text: 'TEXT', accent: 'ACCENT' })
  .replaceAll('fill="ACCENT"', 'class="a"')
  .replaceAll('fill="BODY"', 'class="b"')
  .replaceAll('fill="TEXT"', 'class="t"');
write(
  'favicon.svg',
  `<svg xmlns="http://www.w3.org/2000/svg" viewBox="0 -2 64 64">` +
    `<style>.b{fill:${L.body}}.t{fill:${L.text}}.a{fill:${L.accent}}` +
    `@media (prefers-color-scheme:dark){.b{fill:${D.body}}.t{fill:${D.text}}.a{fill:${D.accent}}}</style>` +
    inner +
    `</svg>`,
);

// ---- PNG favicon, transparent, light theme ----
const flat = (colors) => `<svg xmlns="http://www.w3.org/2000/svg" viewBox="0 -2 64 64">${markInner(colors)}</svg>`;
write('favicon-32.png', png(flat(L), 32));

// ---- App icons: paper mark on an ink square (the "app / social avatar" from the brand sheet) ----
const appIcon = (size) => {
  const k = (size * 0.58) / 60;
  const tx = size / 2 - k * 32;
  const ty = size / 2 - k * 30;
  return (
    `<svg xmlns="http://www.w3.org/2000/svg" width="${size}" height="${size}" viewBox="0 0 ${size} ${size}">` +
    `<rect width="${size}" height="${size}" fill="${INK}"/>` +
    `<g transform="translate(${tx.toFixed(2)} ${ty.toFixed(2)}) scale(${k.toFixed(4)})">${markInner(D)}</g></svg>`
  );
};
write('apple-touch-icon.png', png(appIcon(180), 180));
write('icon-192.png', png(appIcon(192), 192));
write('icon-512.png', png(appIcon(512), 512));

write(
  'site.webmanifest',
  JSON.stringify(
    {
      name: 'AI Founder Files',
      short_name: 'AI Founder Files',
      description: 'One founder. One company. One deep dive.',
      start_url: '/',
      display: 'browser',
      theme_color: INK,
      background_color: PAPER,
      icons: [
        { src: '/icon-192.png', sizes: '192x192', type: 'image/png' },
        { src: '/icon-512.png', sizes: '512x512', type: 'image/png' },
      ],
    },
    null,
    2,
  ),
);

// ---- Default OG image, 1200×630 ----
const lines = ['ONE FOUNDER.', 'ONE COMPANY.', 'ONE DEEP DIVE.'];
const headSize = 108;
const headline = lines
  .map((t, i) => {
    const { d, width } = outline('archivo85', t, { x: 64, y: 232 + i * 106, size: headSize, tracking: -1 });
    if (width > 1072) console.warn('headline too wide:', t, width);
    return `<path d="${d}" fill="${i === 2 ? SIGNAL_LIGHT : PAPER}"/>`;
  })
  .join('');
const eyebrow = outline('mono500', 'AI FOUNDER FILES  ·  WEEKLY', { x: 64, y: 100, size: 22, tracking: 4.4 });
const domain = outline('mono500', 'aifounderfiles.com', { x: 150, y: 548, size: 26, tracking: 2.6 });
write(
  'og-default.png',
  png(
    `<svg xmlns="http://www.w3.org/2000/svg" width="1200" height="630" viewBox="0 0 1200 630">` +
      `<rect width="1200" height="630" fill="${INK}"/>` +
      `<path d="${eyebrow.d}" fill="${INK_MUTED}"/>` +
      headline +
      `<g transform="translate(64 502)">${markInner(D)}</g>` +
      `<path d="${domain.d}" fill="${PAPER}"/>` +
      `</svg>`,
    1200,
  ),
);
