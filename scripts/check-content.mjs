#!/usr/bin/env node
/**
 * Editorial checks for src/content/files. It reports; it never edits copy.
 *
 *   npm run check:content             print the report, exit 0
 *   npm run check:content -- --strict exit 1 if anything is flagged (for CI)
 *
 * Checks:
 *   figures     figures in the title, description, standfirst or fact box that the body doesn't repeat,
 *               and higher figures the body gives for the same thing (valuation, salary)
 *   unsourced   sentences with a number in them and no [^n] citation marker
 *   links       first mention of another file's company or founder that isn't linked
 *   spelling    US spellings (the site is en-GB)
 *   description meta descriptions over 155 characters
 *   todos       TODO(owner) markers left in content
 */
import fs from 'node:fs';
import path from 'node:path';
import matter from 'gray-matter';

const root = path.resolve(path.dirname(new URL(import.meta.url).pathname), '..');
const strict = process.argv.includes('--strict');

const read = (dir) =>
  fs
    .readdirSync(path.join(root, dir))
    .filter((f) => /\.mdx?$/.test(f))
    .map((f) => {
      const raw = fs.readFileSync(path.join(root, dir, f), 'utf8');
      const { data, content } = matter(raw);
      return { id: f.replace(/\.mdx?$/, ''), file: `${dir}/${f}`, raw, data, body: content };
    });

const files = read('src/content/files').filter((f) => !f.data.draft);
let flagged = 0;
const out = [];
const flag = (heading, lines) => {
  if (lines.length === 0) return;
  flagged += lines.length;
  out.push(`\n## ${heading}`, ...lines);
};

// ---------- figure parsing ----------
const UNITS = { trillion: 1e12, trn: 1e12, tn: 1e12, billion: 1e9, bn: 1e9, b: 1e9, million: 1e6, m: 1e6, mn: 1e6, thousand: 1e3, k: 1e3 };
const MONEY_RE = /\$\s?(\d[\d,]*(?:\.\d+)?)\s?(trillion|billion|million|thousand|trn|tn|bn|mn|b|m|k)?\b/gi;
const money = (text) =>
  [...text.matchAll(MONEY_RE)].map((m) => Number(m[1].replace(/,/g, '')) * (UNITS[(m[2] ?? '').toLowerCase()] ?? 1));
const pretty = (n) =>
  n >= 1e12 ? `$${+(n / 1e12).toFixed(2)}trn` : n >= 1e9 ? `$${+(n / 1e9).toFixed(2)}bn` : n >= 1e6 ? `$${+(n / 1e6).toFixed(2)}m` : `$${n.toLocaleString('en-GB')}`;

const plain = (md) =>
  md
    .replace(/```[\s\S]*?```/g, ' ')
    .replace(/\[\^[\d,\s]+\]/g, '')
    .replace(/\[([^\]]+)\]\([^)]*\)/g, '$1')
    .replace(/[*_`>]/g, '')
    .replace(/^#+\s.*$/gm, '')
    .replace(/^\s*(?:[-]|\d+\.)\s+/gm, '');

const sentences = (md) =>
  md
    .replace(/```[\s\S]*?```/g, ' ')
    .replace(/^#+\s.*$/gm, '')
    .replace(/^\s*(?:[-]|\d+\.)\s+/gm, '')
    .replace(/\*\*/g, '')
    .split(/\n{2,}|\n/)
    .map((p) => p.replace(/\b(St|Mr|Mrs|Dr|vs|No)\.\s/g, '$1\u2024 ').replace(/\bD\.E\.\s/g, 'D\u2024E\u2024 '))
    .flatMap((p) => p.split(/(?<=[.!?](?:\[\^[\d,\s]+\])?["”']?)\s+(?=[A-Z"“(\d])/))
    .map((s) => s.replace(/\u2024/g, '.').trim())
    .filter(Boolean);

// What a figure is about. For each topic word, the nearest dollar figure within 70 characters is "the figure for it".
const TOPICS = {
  valuation: /\bvalu(?:ation|ed)\b/gi,
  salary: /\bsalary\b/gi,
};
const MONEY_AT = /\$\s?(\d[\d,]*(?:\.\d+)?)\s?(trillion|billion|million|thousand|trn|tn|bn|mn|b|m|k)?\b/gi;
function figuresFor(text, topicRe) {
  const figs = [...text.matchAll(MONEY_AT)].map((m) => ({
    at: m.index,
    value: Number(m[1].replace(/,/g, '')) * (UNITS[(m[2] ?? '').toLowerCase()] ?? 1),
  }));
  const found = new Map();
  for (const k of text.matchAll(topicRe)) {
    const near = figs
      .map((f) => ({ ...f, d: Math.abs(f.at - k.index) }))
      .filter((f) => f.d <= 70)
      .sort((x, y) => x.d - y.d)[0];
    if (near) found.set(near.value, true);
  }
  return [...found.keys()];
}

// ---------- 1. figures ----------
const figureLines = [];
for (const f of files) {
  const d = f.data;
  const head = [
    ['title', d.title],
    ['standfirst', d.standfirst],
    ...(d.description ? [['description', d.description]] : []),
    ['fact box: funding', d.company.funding ?? ''],
    ['fact box: stage', d.company.stage ?? ''],
    ['fact box: model', d.company.businessModel ?? ''],
  ].filter(([, v]) => v);

  const bodySentences = sentences(f.body);
  const bodyAll = new Set(money(plain(f.body)));

  // (a) a figure in the header that the body never repeats
  for (const [where, text] of head) {
    for (const v of money(text)) {
      if (!bodyAll.has(v)) figureLines.push(`- ${f.id}: ${pretty(v)} appears in the ${where} but nowhere in the body.`);
    }
  }

  // (b) the body gives a higher figure for something the header already has a figure for. A higher
  // valuation or round than the header's "latest" is the usual sign the header has gone stale. Lower
  // ones are normally earlier rounds, so they're only counted.
  for (const [topic, re] of Object.entries(TOPICS)) {
    const headFigs = new Set(head.flatMap(([, t]) => figuresFor(t, re)));
    if (headFigs.size === 0) continue;
    const ceiling = Math.max(...headFigs);
    const higher = new Map();
    let lower = 0;
    for (const s of bodySentences) {
      for (const v of figuresFor(s, re)) {
        if (headFigs.has(v)) continue;
        if (v > ceiling) higher.set(v, higher.get(v) ?? s);
        else lower++;
      }
    }
    for (const [v, s] of higher) {
      figureLines.push(
        `- ${f.id}: header ${topic} figure ${[...headFigs].map(pretty).join(' / ')}; the body also gives a higher one, ${pretty(v)}: “${s.slice(0, 200)}${s.length > 200 ? '…' : ''}”`,
      );
    }
    if (lower) figureLines.push(`- ${f.id}: (${lower} lower ${topic} figure${lower === 1 ? '' : 's'} in the body, probably earlier rounds or other companies; not listed)`);
  }
}
flag('Figures: header vs body (review; copy is not changed)', figureLines);

// ---------- 2. unsourced numeric claims ----------
const NUMERIC = /\$\s?\d|\d[\d,.]*\s?(?:%|per ?cent|million|billion|trillion|bn|gigawatts?|employees|interviews|words)\b/i;
const unsourced = [];
for (const f of files) {
  const n = f.data.sources?.length ?? 0;
  const list = sentences(f.body).filter((s) => NUMERIC.test(s) && !/\[\^\d/.test(s) && !/^(?:That's File|Facts in this file|\*Facts)/.test(s));
  if (list.length) unsourced.push(`- ${f.id} (${list.length} of ${sentences(f.body).length} sentences; ${n} sources listed):`, ...list.map((s) => `    · ${s.slice(0, 200)}${s.length > 200 ? '…' : ''}`));
}
flag('Sentences with a number and no [^n] citation', unsourced);

// ---------- 3. unlinked mentions of other files ----------
const aliasesOf = (d) => {
  const names = new Set([d.company.name]);
  const parts = d.founder.name.split(/\s+and\s+/);
  const surname = parts.at(-1).split(' ').slice(1).pop();
  parts.forEach((p, i) => names.add(i < parts.length - 1 && !p.includes(' ') && surname ? `${p} ${surname}` : p));
  if (parts.length > 1 && surname) [surname, `${surname}s`].forEach((s) => names.add(s));
  return [...names];
};
const linkLines = [];
for (const f of files) {
  for (const other of files.filter((o) => o.id !== f.id)) {
    const url = `/files/${other.id}/`;
    const aliases = aliasesOf(other.data);
    // Remove link markup and headings, then look for the first mention not inside a link.
    const stripped = f.body.replace(/\[[^\]]*\]\([^)]*\)/g, (m) => (m.includes(url) ? '\u0000'.repeat(m.length) : ' '.repeat(m.length)));
    if (stripped.includes('\u0000')) continue; // already linked at least once
    const re = new RegExp(`\\b(${aliases.map((a) => a.replace(/[.*+?^${}()|[\]\\]/g, '\\$&')).join('|')})\\b`);
    const m = re.exec(stripped.replace(/^#+\s.*$/gm, (h) => ' '.repeat(h.length)));
    if (m) linkLines.push(`- ${f.id}: mentions “${m[1]}” (File #${String(other.data.fileNumber).padStart(3, '0')}, ${url}) with no link.`);
  }
}
flag('Mentions of other files that are not linked', linkLines);

// ---------- 4. British spelling ----------
const IZE_OK = /^(?:size[sd]?|sizes|seiz\w*|prize[sd]?|capsize\w*|resize\w*|downsize\w*|oversize\w*|bizarre|adize)$/i;
const US_WORDS = /\b(percent|color\w*|favorite\w*|center(?:s|ed)?|defense|license[sd]?|analyze[sd]?|analyzing|labeled|labeling|traveled|traveling|canceled|modeling|gray|catalog|program(?!me)\w*(?=\s+(?:of|for)\b)|neighbor\w*|behavior\w*|honor\w*|jewelry|fulfill\w*|skeptic\w*|theater|meter(?=s? of)|check(?=ed? in))\b/gi;
const spelling = [];
for (const f of files) {
  const text = plain(f.body);
  const hits = new Map();
  for (const m of text.matchAll(/\b([A-Za-z]{4,}(?:iz(?:e|es|ed|ing|ation|ations)|yz(?:e|es|ed|ing)))\b/g)) if (!IZE_OK.test(m[1])) hits.set(m[1], (hits.get(m[1]) ?? 0) + 1);
  for (const m of text.matchAll(US_WORDS)) hits.set(m[1], (hits.get(m[1]) ?? 0) + 1);
  if (hits.size) spelling.push(`- ${f.id}: ${[...hits].map(([w, n]) => `${w}${n > 1 ? ` ×${n}` : ''}`).join(', ')}`);
}
flag('Possible US spellings in the body (quotes and proper nouns may be fine; “percent” is US style, the Guardian/Times use “per cent”, the BBC uses %)', spelling);

// ---------- 5. meta description length ----------
const desc = [];
for (const f of files) {
  const text = f.data.description ?? f.data.standfirst;
  if (text.length > 160) desc.push(`- ${f.id}: ${f.data.description ? 'description' : 'standfirst (used as the description)'} is ${text.length} characters; aim for about 155.`);
}
flag('Meta descriptions over ~155 characters', desc);

// ---------- 6. TODO(owner) markers ----------
const todos = [];
for (const dir of ['src/content/files', 'src/content/authors']) {
  for (const f of read(dir)) {
    f.raw.split('\n').forEach((line, i) => {
      if (/TODO\(owner\)/.test(line)) todos.push(`- ${f.file}:${i + 1}: ${line.trim().slice(0, 140)}`);
    });
  }
}
flag('TODO(owner) markers in content', todos);

console.log(`# Content check: ${files.length} published file${files.length === 1 ? '' : 's'}`);
console.log(out.length ? out.join('\n') : '\nNothing flagged.');
console.log(`\n${flagged} item${flagged === 1 ? '' : 's'} flagged.`);
if (strict && flagged > 0) process.exit(1);
