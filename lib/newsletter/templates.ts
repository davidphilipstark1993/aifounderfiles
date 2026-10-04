import { SITE_NAME, SITE_TAGLINE, SITE_URL } from './env.js';
import type { Message } from './sendgrid.js';

// Brand tokens (src/styles/tokens.css). Emails can't use webfonts reliably, so headlines use
// a heavy system sans and body copy a system serif; the look carries through colour and layout.
const C = {
  ink: '#0E1A2B',
  signal: '#C7431D',
  signalLight: '#F06A3F',
  paper: '#F7F5F0',
  manila: '#E8DCC0',
  slate: '#33506F',
  graphite: '#5B6573',
  rule: '#E2DDD2',
  muted: '#AEB6C2',
};
const SANS = "'Archivo','Helvetica Neue',Helvetica,Arial,sans-serif";
const SERIF = "'Source Serif 4',Georgia,'Times New Roman',serif";
const MONO = "'JetBrains Mono','Courier New',Courier,monospace";

/** SendGrid swaps this tag for the recipient's one-click unsubscribe URL (needs an unsubscribe group). */
export const UNSUBSCRIBE_TAG = '%asm_group_unsubscribe_raw_url%';

export const esc = (s: string): string =>
  s.replace(/&/g, '&amp;').replace(/</g, '&lt;').replace(/>/g, '&gt;').replace(/"/g, '&quot;');

export interface IssueFile {
  slug: string;
  title: string;
  standfirst: string;
  fileNumber: number;
  publishDate: Date;
  founder: { name: string; role: string };
  company: { name: string; founded?: string; hq?: string; sector: string; funding?: string };
}

const fileNo = (n: number) => `#${String(n).padStart(3, '0')}`;
const undisclosed = (v?: string) => (v && v.trim() ? v : 'Undisclosed');
const dateLong = (d: Date) =>
  new Intl.DateTimeFormat('en-GB', { day: 'numeric', month: 'long', year: 'numeric', timeZone: 'UTC' }).format(d);

function shell(opts: { preheader: string; headerRight: string; body: string; footer: string }): string {
  return `<!DOCTYPE html>
<html lang="en-GB">
<head>
<meta charset="UTF-8" />
<meta name="viewport" content="width=device-width,initial-scale=1.0" />
<meta name="color-scheme" content="light" />
<title>${esc(SITE_NAME)}</title>
</head>
<body style="margin:0;padding:0;background:${C.paper};">
<div style="display:none;max-height:0;overflow:hidden;opacity:0;color:${C.paper};">${esc(opts.preheader)}</div>
<table role="presentation" width="100%" cellpadding="0" cellspacing="0" border="0" style="background:${C.paper};">
<tr><td align="center" style="padding:24px 12px;">
  <table role="presentation" width="600" cellpadding="0" cellspacing="0" border="0" style="width:100%;max-width:600px;">
    <tr>
      <td style="background:${C.ink};padding:18px 28px;border-radius:6px 6px 0 0;">
        <table role="presentation" width="100%" cellpadding="0" cellspacing="0" border="0"><tr>
          <td style="font-family:${SANS};font-weight:900;font-size:20px;letter-spacing:-0.4px;text-transform:uppercase;line-height:1;">
            <a href="${SITE_URL}/" style="text-decoration:none;color:${C.paper};">AI Founder <span style="color:${C.signalLight};">Files</span></a>
          </td>
          <td align="right" style="font-family:${MONO};font-size:11px;letter-spacing:1.5px;text-transform:uppercase;color:${C.muted};">${esc(opts.headerRight)}</td>
        </tr></table>
      </td>
    </tr>
    <tr><td style="background:#ffffff;padding:32px 28px 8px;">${opts.body}</td></tr>
    <tr>
      <td style="background:#ffffff;padding:20px 28px 28px;border-top:1px solid ${C.rule};border-radius:0 0 6px 6px;">${opts.footer}</td>
    </tr>
  </table>
</td></tr>
</table>
</body>
</html>`;
}

const footerHtml = (reason: string, withUnsubscribe: boolean) => `
<p style="margin:0 0 8px;font-family:${SERIF};font-size:13px;line-height:1.5;color:${C.graphite};">${esc(reason)}</p>
<p style="margin:0;font-family:${MONO};font-size:11px;letter-spacing:1px;text-transform:uppercase;color:${C.graphite};">
  <a href="${SITE_URL}/" style="color:${C.ink};">aifounderfiles.com</a>${
    withUnsubscribe
      ? ` &nbsp;·&nbsp; <a href="${UNSUBSCRIBE_TAG}" style="color:${C.ink};">Unsubscribe</a>`
      : ''
  }
</p>`;

const button = (href: string, label: string) => `
<table role="presentation" cellpadding="0" cellspacing="0" border="0" style="margin:8px 0 28px;"><tr>
  <td style="background:${C.signal};border-radius:4px;">
    <a href="${href}" style="display:inline-block;padding:14px 26px;font-family:${MONO};font-weight:700;font-size:13px;letter-spacing:1.6px;text-transform:uppercase;color:#ffffff;text-decoration:none;">${esc(label)}</a>
  </td>
</tr></table>`;

/** Welcome email sent when someone subscribes. */
export function renderWelcome(opts: { unsubscribeAvailable: boolean }): Message {
  const body = `
<p style="margin:0 0 14px;font-family:${MONO};font-weight:700;font-size:12px;letter-spacing:1.8px;text-transform:uppercase;color:${C.signal};">You're on the list</p>
<h1 style="margin:0 0 18px;font-family:${SANS};font-weight:900;font-size:34px;line-height:1;letter-spacing:-0.8px;text-transform:uppercase;color:${C.ink};">${esc(SITE_TAGLINE)}</h1>
<p style="margin:0 0 16px;font-family:${SERIF};font-size:17px;line-height:1.55;color:${C.ink};">Thanks for subscribing. Every week we open one file: the founder, the product, the funding and the business model behind a new AI company, told in full.</p>
<p style="margin:0 0 24px;font-family:${SERIF};font-size:17px;line-height:1.55;color:${C.ink};">Each file arrives in your inbox on Sunday as a PDF you can read, save or share.</p>
${button(SITE_URL + '/about/', 'About AI Founder Files')}`;
  const text = `You're on the list.

${SITE_TAGLINE}

Thanks for subscribing. Every week we open one file: the founder, the product, the funding and the business model behind a new AI company, told in full.

Each file arrives in your inbox on Sunday as a PDF you can read, save or share.\n\nAbout AI Founder Files: ${SITE_URL}/about/

--
You're receiving this because you subscribed at aifounderfiles.com.${opts.unsubscribeAvailable ? `\nUnsubscribe: ${UNSUBSCRIBE_TAG}` : ''}
`;
  return {
    subject: "You're on the list: AI Founder Files",
    html: shell({
      preheader: 'One founder. One company. One deep dive, every week.',
      headerRight: 'Welcome',
      body,
      footer: footerHtml('You are receiving this because you subscribed at aifounderfiles.com.', opts.unsubscribeAvailable),
    }),
    text,
    categories: ['welcome'],
  };
}

/** The weekly email for one published file. */
export function renderIssue(file: IssueFile): Message {
  const url = `${SITE_URL}/files/${file.slug}/`;
  const rows: [string, string][] = [
    ['Founder', file.founder.name],
    ['Company', file.company.name],
    ['Founded', undisclosed(file.company.founded)],
    ['HQ', undisclosed(file.company.hq)],
    ['Sector', file.company.sector],
    ['Funding', undisclosed(file.company.funding)],
  ];
  const factRows = rows
    .map(
      ([k, v]) => `<tr>
  <td width="92" style="width:92px;padding:4px 14px 4px 0;font-family:${MONO};font-size:12px;letter-spacing:1px;text-transform:uppercase;color:${C.ink};white-space:nowrap;vertical-align:top;">${esc(k)}</td>
  <td style="padding:4px 0;font-family:${MONO};font-size:13px;color:${C.ink};">${esc(v)}</td>
</tr>`,
    )
    .join('');

  const body = `
<p style="margin:0 0 14px;font-family:${MONO};font-weight:700;font-size:12px;letter-spacing:1.8px;text-transform:uppercase;color:${C.signal};">This week's file · Founder File ${fileNo(file.fileNumber)}</p>
<h1 style="margin:0 0 18px;font-family:${SANS};font-weight:900;font-size:34px;line-height:1.02;letter-spacing:-0.8px;text-transform:uppercase;color:${C.ink};">${esc(file.title)}</h1>
<p style="margin:0 0 26px;font-family:${SERIF};font-size:18px;line-height:1.5;color:${C.slate};">${esc(file.standfirst)}</p>
<table role="presentation" width="100%" cellpadding="0" cellspacing="0" border="0" style="margin:0 0 26px;background:${C.manila};border-radius:4px;">
  <tr><td style="padding:18px 20px 16px;">
    <p style="margin:0 0 10px;padding:0 0 10px;border-bottom:1px solid #c9bd9f;font-family:${MONO};font-weight:700;font-size:12px;letter-spacing:2px;text-transform:uppercase;color:${C.ink};">The File</p>
    <table role="presentation" cellpadding="0" cellspacing="0" border="0">${factRows}</table>
  </td></tr>
</table>
${button(url, 'Read the file →')}`;

  const text = `FOUNDER FILE ${fileNo(file.fileNumber)}

${file.title.toUpperCase()}

${file.standfirst}

THE FILE
${rows.map(([k, v]) => `${k.toUpperCase().padEnd(8)} ${v}`).join('\n')}

Read the file: ${url}

--
You're receiving this because you subscribed at aifounderfiles.com.
Unsubscribe: ${UNSUBSCRIBE_TAG}
`;

  return {
    subject: `Founder File ${fileNo(file.fileNumber)}: ${file.title}`,
    html: shell({
      preheader: file.standfirst,
      headerRight: `${fileNo(file.fileNumber)} · ${dateLong(file.publishDate)}`,
      body,
      footer: footerHtml('You are receiving this because you subscribed at aifounderfiles.com.', true),
    }),
    text,
    categories: [`file-${file.slug}`],
  };
}

export interface PdfIssue {
  issueNumber: number;
  title: string;
  note?: string | null;
  pdfUrl: string;
  date: Date;
}

/** The weekly email for one uploaded PDF issue: a short note and a download button. */
export function renderPdfIssue(issue: PdfIssue): Message {
  const num = fileNo(issue.issueNumber);
  const paragraphs = (issue.note ?? '')
    .split(/\n\s*\n/)
    .map((p) => p.trim())
    .filter(Boolean);
  const noteHtml = paragraphs
    .map(
      (p) =>
        `<p style="margin:0 0 16px;font-family:${SERIF};font-size:17px;line-height:1.55;color:${C.ink};">${esc(p).replace(/\n/g, '<br />')}</p>`,
    )
    .join('');

  const body = `
<p style="margin:0 0 14px;font-family:${MONO};font-weight:700;font-size:12px;letter-spacing:1.8px;text-transform:uppercase;color:${C.signal};">New file · Issue ${num}</p>
<h1 style="margin:0 0 22px;font-family:${SANS};font-weight:900;font-size:34px;line-height:1.02;letter-spacing:-0.8px;text-transform:uppercase;color:${C.ink};">${esc(issue.title)}</h1>
${noteHtml}
${button(issue.pdfUrl, 'Download the PDF →')}
<p style="margin:0 0 24px;font-family:${SERIF};font-size:14px;line-height:1.5;color:${C.graphite};">Button not working? Copy this link into your browser:<br /><a href="${issue.pdfUrl}" style="color:${C.slate};word-break:break-all;">${esc(issue.pdfUrl)}</a></p>`;

  const text = `NEW FILE · ISSUE ${num}

${issue.title.toUpperCase()}

${paragraphs.join('\n\n')}${paragraphs.length ? '\n\n' : ''}Download the PDF: ${issue.pdfUrl}

--
You're receiving this because you subscribed at aifounderfiles.com.
Unsubscribe: ${UNSUBSCRIBE_TAG}
`;

  return {
    subject: `AI Founder Files ${num}: ${issue.title}`,
    html: shell({
      preheader: paragraphs[0]?.slice(0, 140) || 'This week’s file is ready to download.',
      headerRight: `${num} · ${dateLong(issue.date)}`,
      body,
      footer: footerHtml('You are receiving this because you subscribed at aifounderfiles.com.', true),
    }),
    text,
    categories: [`issue-${issue.issueNumber}`],
  };
}
