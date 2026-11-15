export const SITE = {
  name: 'AI Founder Files',
  url: 'https://aifounderfiles.com',
  domain: 'aifounderfiles.com',
  tagline: 'One founder. One company. One deep dive.',
  description:
    'Weekly case studies of founders who use AI to start and run their businesses: the tools, the workflow, the numbers and what you can copy.',
  /** Home page search title (used as is, without the brand suffix). */
  homeTitle: 'How Founders Use AI to Start a Business | AI Founder Files',
  // Set these up as real mailboxes before launch (see README).
  contactEmail: 'info@aifounderfiles.com',
  correctionsEmail: 'info@aifounderfiles.com',
  nav: [
    { label: 'Latest', href: '/#latest' },
    { label: 'Founders', href: '/founders/' },
    { label: 'Companies', href: '/companies/' },
    { label: 'Archive', href: '/archive/' },
    { label: 'Blog', href: '/blog/' },
  ],
} as const;

/** The four editorial pillars. `slug` is the value of `pillar` in an article's frontmatter and the /topics/<slug>/ URL. */
export const PILLARS = [
  {
    slug: 'founder-files',
    name: 'AI Founder Files',
    // Search title. The pillar name matches the site name, so "AI Founder Files | AI Founder Files" would repeat itself.
    seoTitle: 'Founder Profiles: How People Build With AI',
    short: 'Founders',
    blurb: 'Profiles of founders who build with AI, and of the people behind the AI tools they use: where they came from and how they got started.',
  },
  {
    slug: 'company-files',
    name: 'Company Files',
    seoTitle: 'Company Files: Businesses Built With AI',
    short: 'Companies',
    blurb: 'How individual businesses built with AI operate and compete: product, funding, rivals and what protects them.',
  },
  {
    slug: 'how-they-built-it',
    name: 'How They Built It',
    seoTitle: 'How They Built It: Founders Who Build With AI',
    short: 'How they built it',
    blurb: 'The practical choices behind businesses built with AI: the tools, the workflow, how they find customers and what it all costs.',
  },
  {
    slug: 'business-models',
    name: 'Business Models',
    seoTitle: 'Business Models: How AI-Built Businesses Earn',
    short: 'Business models',
    blurb: 'How businesses built with AI make money: pricing, costs, automation and the numbers behind them.',
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
  slug: 'maarten-road-exemptions',
  pdf: '/sample/founder-file-004-maarten-road-exemptions.pdf',
  pdfPages: 8,
} as const;
