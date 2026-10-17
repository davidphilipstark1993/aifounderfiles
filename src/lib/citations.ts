import { defineMdastPlugin } from 'satteri';

/**
 * Inline citations. Write `[^3]` (or `[^3,5]`) after a claim in a file's body; it renders as a superscript
 * link to the 3rd entry of the file's `sources` list, and that entry gets a back-link to the claim.
 * The build fails if a marker points at a source that doesn't exist.
 */
// Works in .md files. (.mdx would need its own pass.)

/** Matches `[^3]` and `[^3,5]`. Group 1 is the comma-separated source numbers. */
export const CITATION_RE = /\[\^(\d+(?:\s*,\s*\d+)*)\]/g;

export const sourceAnchor = (n: number) => `source-${n}`;
export const citeAnchor = (n: number, occurrence: number, scope = 'cite') => `${scope}-${n}-${occurrence}`;

export const parseCitationNumbers = (group: string) => group.split(',').map((s) => Number(s.trim()));

const escapeAttr = (s: string) => s.replace(/&/g, '&amp;').replace(/"/g, '&quot;').replace(/</g, '&lt;');

/** The superscript link(s) for one marker, as inline HTML. */
export function citationHtml(numbers: number[], occurrence: (n: number) => number, scope = 'cite'): string {
  const links = numbers
    .map(
      (n) =>
        `<a class="cite__link" id="${escapeAttr(citeAnchor(n, occurrence(n), scope))}" href="#${sourceAnchor(n)}" aria-label="Source ${n}">[${n}]</a>`,
    )
    .join('\u2009');
  return `<sup class="cite">${links}</sup>`;
}

/**
 * Sätteri (mdast) plugin: turns `[^n]` markers in text into superscript links and checks them against
 * the file's `sources`. Astro 7 renders Markdown with Sätteri, so this is passed to `satteri({ mdastPlugins })`.
 * Markers inside code, links and raw HTML are left alone.
 */
export const citationsPlugin = defineMdastPlugin({
  name: 'citations',
  text(node, ctx) {
    if (!node.value.includes('[^')) return;
    const parentType = ctx.parent(node)?.type;
    if (parentType === 'link' || parentType === 'linkReference') return;
    const matches = [...node.value.matchAll(CITATION_RE)];
    if (matches.length === 0) return;

    const sourceCount = ctx.data.astro?.frontmatter?.sources?.length ?? 0;
    const out: ({ type: 'text'; value: string } | { type: 'html'; value: string })[] = [];
    let last = 0;
    for (const m of matches) {
      const numbers = parseCitationNumbers(m[1]);
      for (const n of numbers) {
        if (n < 1 || n > sourceCount) {
          throw new Error(`${ctx.fileURL?.pathname ?? 'file'}: citation [^${n}] has no matching source (the file lists ${sourceCount}).`);
        }
      }
      if (m.index! > last) out.push({ type: 'text', value: node.value.slice(last, m.index) });
      out.push({ type: 'html', value: citationHtml(numbers, nextOccurrence(ctx.data)) });
      last = m.index! + m[0].length;
    }
    if (last < node.value.length) out.push({ type: 'text', value: node.value.slice(last) });
    ctx.replaceNode(node, out);
  },
});

/** Per-document counter, so each citation of the same source gets its own anchor (`cite-3-1`, `cite-3-2`, ...). */
const counters = new WeakMap<object, Map<number, number>>();
function nextOccurrence(data: object) {
  if (!counters.has(data)) counters.set(data, new Map());
  const seen = counters.get(data)!;
  return (n: number) => {
    seen.set(n, (seen.get(n) ?? 0) + 1);
    return seen.get(n)!;
  };
}

/**
 * How many times each source is cited in a file's body, in reading order, so the Sources list can link
 * back to every spot. Mirrors the plugin: markers inside fenced code are ignored.
 */
export function citationCounts(body = ''): Map<number, number> {
  const counts = new Map<number, number>();
  for (const m of body.replace(/```[\s\S]*?```/g, ' ').matchAll(CITATION_RE)) {
    for (const n of parseCitationNumbers(m[1])) counts.set(n, (counts.get(n) ?? 0) + 1);
  }
  return counts;
}
