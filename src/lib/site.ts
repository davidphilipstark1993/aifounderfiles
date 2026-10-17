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

/** The four editorial pillars. `slug` is the value of `pillar` in an article's frontmatter and the /topics/<slug>/ URL. */
export const PILLARS = [
  {
    slug: 'founder-files',
    name: 'AI Founder Files',
    short: 'Founders',
    blurb: 'The people behind AI companies: where they came from, what they saw that others missed, and how they got started.',
  },
  {
    slug: 'company-files',
    name: 'AI Company Files',
    short: 'Companies',
    blurb: 'How individual AI companies operate and compete: product, funding, rivals and what protects them.',
  },
  {
    slug: 'how-they-built-it',
    name: 'How They Built It',
    short: 'How they built it',
    blurb: 'Customer acquisition, distribution, product and operations: the practical choices behind AI businesses that work.',
  },
  {
    slug: 'business-models',
    name: 'AI Business Models',
    short: 'Business models',
    blurb: 'Pricing, monetisation, automation and the economics of AI businesses.',
  },
] as const;
export type PillarSlug = (typeof PILLARS)[number]['slug'];
export const DEFAULT_PILLAR: PillarSlug = 'founder-files';
/** A topic hub is only indexed once it has this many articles; before that it would be a thin page. */
export const HUB_MIN_FILES = 3;

/**
 * The file shown to visitors as "this is what you get" (home page and /subscribe/).
 * `slug` is the article's filename in src/content/files; the PDF is the same issue as emailed to subscribers.
 */
export const SAMPLE_ISSUE = {
  slug: 'sam-altman',
  pdf: '/sample/founder-file-001-sam-altman.pdf',
  pdfPages: 7,
} as const;
