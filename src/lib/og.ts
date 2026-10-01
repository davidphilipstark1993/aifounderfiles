import satori from 'satori';
import { Resvg } from '@resvg/resvg-js';
import { THEMES, markSvgString, readFontBuffer } from '../../scripts/lib/outline.mjs';

const INK = '#0E1A2B';
const PAPER = '#F7F5F0';
const SIGNAL_LIGHT = '#F06A3F';
const INK_MUTED = '#AEB6C2';

type Node = { type: string; props: Record<string, unknown> };
const h = (type: string, style: Record<string, unknown>, children?: unknown, extra: Record<string, unknown> = {}): Node => ({
  type,
  props: { style: { display: 'flex', ...style }, children, ...extra },
});

let fonts: { name: string; data: ArrayBuffer; weight: 400 | 500 | 700 | 900; style: 'normal' }[] | undefined;
const toArrayBuffer = (b: Buffer) => b.buffer.slice(b.byteOffset, b.byteOffset + b.byteLength) as ArrayBuffer;
function loadFonts() {
  fonts ??= [
    { name: 'Archivo Condensed', data: toArrayBuffer(readFontBuffer('archivo85')), weight: 900, style: 'normal' },
    { name: 'JetBrains Mono', data: toArrayBuffer(readFontBuffer('mono500')), weight: 500, style: 'normal' },
    { name: 'JetBrains Mono', data: toArrayBuffer(readFontBuffer('mono700')), weight: 700, style: 'normal' },
  ];
  return fonts;
}

const markDataUri = `data:image/svg+xml;base64,${Buffer.from(markSvgString(THEMES.dark)).toString('base64')}`;

function headlineSize(title: string) {
  const n = title.length;
  if (n <= 28) return 112;
  if (n <= 48) return 96;
  if (n <= 72) return 80;
  if (n <= 100) return 68;
  return 56;
}

/** "Social card" from brand sheet 04: ink ground, headline, NEW FILE stamp, logo + domain. */
export async function renderFileOg(opts: { title: string; fileNumber: number }): Promise<Buffer> {
  const num = String(opts.fileNumber).padStart(3, '0');
  const tree = h(
    'div',
    { width: 1200, height: 630, flexDirection: 'column', justifyContent: 'space-between', background: INK, padding: '56px 64px' },
    [
      h('div', { justifyContent: 'space-between', alignItems: 'flex-start' }, [
        h('div', { color: INK_MUTED, fontFamily: 'JetBrains Mono', fontSize: 24, fontWeight: 500, letterSpacing: 4, paddingTop: 10 }, `FOUNDER FILE #${num}`),
        h(
          'div',
          {
            border: `4px solid ${SIGNAL_LIGHT}`,
            color: SIGNAL_LIGHT,
            fontFamily: 'JetBrains Mono',
            fontWeight: 700,
            fontSize: 28,
            letterSpacing: 5,
            padding: '8px 22px',
            transform: 'rotate(-4deg)',
          },
          'NEW FILE',
        ),
      ]),
      h(
        'div',
        {
          color: PAPER,
          fontFamily: 'Archivo Condensed',
          fontWeight: 900,
          fontSize: headlineSize(opts.title),
          lineHeight: 0.98,
          letterSpacing: -1.5,
          textTransform: 'uppercase',
          maxHeight: 330,
          overflow: 'hidden',
        },
        opts.title,
      ),
      h('div', { alignItems: 'center', gap: 22 }, [
        h('img', { width: 64, height: 56 }, undefined, { src: markDataUri, width: 64, height: 56 }),
        h('div', { color: PAPER, fontFamily: 'JetBrains Mono', fontWeight: 500, fontSize: 26, letterSpacing: 2.6 }, 'aifounderfiles.com'),
      ]),
    ],
  );

  const svg = await satori(tree as never, { width: 1200, height: 630, fonts: loadFonts() });
  return Buffer.from(new Resvg(svg, { fitTo: { mode: 'width', value: 1200 } }).render().asPng());
}
