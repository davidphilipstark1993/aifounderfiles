// Text → SVG path helpers. Used by the brand-asset script and the OG renderer so that
// logo/favicon/OG artwork never depends on a font being installed.
import fs from 'node:fs';
import path from 'node:path';
import opentype from 'opentype.js';

const ROOT = process.cwd();
const cache = new Map();

export const FONT_FILES = {
  archivo85: 'src/assets/fonts/Archivo-Black-w85.ttf',
  archivo100: 'src/assets/fonts/Archivo-Black-w100.ttf',
  mono500: 'node_modules/@fontsource/jetbrains-mono/files/jetbrains-mono-latin-500-normal.woff',
  mono700: 'node_modules/@fontsource/jetbrains-mono/files/jetbrains-mono-latin-700-normal.woff',
};

export function readFontBuffer(key) {
  return fs.readFileSync(path.join(ROOT, FONT_FILES[key]));
}

// Our own serialiser: opentype.js 2.0's toPathData() rounding sometimes emits "NaN" for valid coordinates,
// which silently cuts off the rest of the path when rendered (seen on the default OG image).
const num = (n) => String(Math.round(n * 100) / 100);
function pathData(p) {
  return p.commands
    .map((c) => {
      if (c.type === 'M' || c.type === 'L') return `${c.type}${num(c.x)} ${num(c.y)}`;
      if (c.type === 'Q') return `Q${num(c.x1)} ${num(c.y1)} ${num(c.x)} ${num(c.y)}`;
      if (c.type === 'C') return `C${num(c.x1)} ${num(c.y1)} ${num(c.x2)} ${num(c.y2)} ${num(c.x)} ${num(c.y)}`;
      return 'Z';
    })
    .join('');
}

export function loadFont(key) {
  if (!cache.has(key)) {
    const b = readFontBuffer(key);
    cache.set(key, opentype.parse(b.buffer.slice(b.byteOffset, b.byteOffset + b.byteLength)));
  }
  return cache.get(key);
}

/**
 * Lay out `text` as one SVG path. Returns { d, width } where width is the advance width.
 * anchor: 'start' | 'middle' | 'end' relative to x. tracking is in px (added after every glyph).
 */
export function outline(fontKey, text, { x = 0, y = 0, size = 16, tracking = 0, anchor = 'start' } = {}) {
  const font = loadFont(fontKey);
  const scale = size / font.unitsPerEm;
  const glyphs = [...text].map((ch) => font.charToGlyph(ch));
  const advances = glyphs.map((g, i) => {
    let kern = 0;
    if (glyphs[i + 1]) {
      try {
        kern = font.getKerningValue(g, glyphs[i + 1]) * scale;
      } catch {
        kern = 0;
      }
    }
    return g.advanceWidth * scale + kern + tracking;
  });
  const width = advances.reduce((a, b) => a + b, 0) - tracking;
  let cursor = anchor === 'middle' ? x - width / 2 : anchor === 'end' ? x - width : x;
  let d = '';
  glyphs.forEach((g, i) => {
    d += pathData(g.getPath(cursor, y, size));
    cursor += advances[i];
  });
  return { d, width };
}

export const THEMES = {
  light: { body: '#0E1A2B', text: '#F7F5F0', accent: '#C7431D' },
  dark: { body: '#F7F5F0', text: '#0E1A2B', accent: '#F06A3F' },
};

/** The folder mark, from the brand spec, with "AI" outlined. viewBox 0 0 64 56. */
export function markInner(colors) {
  const { d } = outline('archivo100', 'AI', { x: 32, y: 40, size: 25, anchor: 'middle' });
  return (
    `<path d="M4 9.5 A3.5 3.5 0 0 1 7.5 6 H24 L29 11 H4 Z" fill="${colors.accent}"/>` +
    `<rect x="2" y="10" width="60" height="44" rx="5" fill="${colors.body}"/>` +
    `<path d="${d}" fill="${colors.text}"/>` +
    `<rect x="19" y="45" width="26" height="3" fill="${colors.accent}"/>`
  );
}

export const markSvgString = (colors) =>
  `<svg xmlns="http://www.w3.org/2000/svg" viewBox="0 0 64 56">${markInner(colors)}</svg>`;
