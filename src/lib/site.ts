export const SITE = {
  name: 'AI Founder Files',
  url: 'https://aifounderfiles.com',
  domain: 'aifounderfiles.com',
  tagline: 'One founder. One company. One deep dive.',
  description:
    'A weekly publication profiling one AI founder and their company in depth: the founder, the product, the funding and the business model, told in full.',
  // Set these up as real mailboxes before launch (see README).
  contactEmail: 'info@aifounderfiles.com',
  correctionsEmail: 'info@aifounderfiles.com',
  nav: [
    { label: 'Latest', href: '/#latest' },
    { label: 'Founders', href: '/founders/' },
    { label: 'Companies', href: '/companies/' },
    { label: 'Archive', href: '/archive/' },
  ],
} as const;

/**
 * The file shown to visitors as "this is what you get" (home page and /subscribe/).
 * `slug` is the article's filename in src/content/files; the PDF is the same issue as emailed to subscribers.
 */
export const SAMPLE_ISSUE = {
  slug: 'sam-altman',
  pdf: '/sample/founder-file-001-sam-altman.pdf',
  pdfPages: 7,
} as const;
