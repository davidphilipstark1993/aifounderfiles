/**
 * The issue featured at the top of the home page (this week's file).
 * Update this when a new issue goes out. Once articles are published in src/content/files,
 * the newest published article is shown instead and this file is ignored.
 */
export const currentIssue = {
  fileNumber: 1,
  publishDate: new Date('2026-10-04'),
  title: 'Sam Altman and the company he doesn’t own',
  standfirst:
    'He runs the company behind ChatGPT on a salary of roughly $65,000 to $76,000, and holds no direct stake in a business last valued at $852 billion. This is how Sam Altman got there, and what could still go wrong.',
  facts: [
    { label: 'Founder', value: 'Sam Altman' },
    { label: 'Company', value: 'OpenAI' },
    { label: 'Founded', value: '2015' },
    { label: 'HQ', value: 'San Francisco' },
    { label: 'Sector', value: 'Frontier AI' },
    { label: 'Funding', value: '$122bn round at an $852bn valuation (March 2026)' },
  ],
};
