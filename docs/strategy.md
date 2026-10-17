# AI Founder Files: audit, plan and roadmap

Written 17 October 2026 from the codebase and the live site. Nothing here assumes traffic, subscriber numbers or revenue, because none were available. Search volumes were **not** validated (no keyword tool was connected); every demand claim below is a hypothesis to check in Search Console and a keyword tool before commissioning.

## 1. Audit

### Already working (verified in code or on the live site)

| Area | Finding |
| --- | --- |
| Stack | Astro 7 static site on Vercel; two Vercel Functions (signup, SendGrid webhook); Supabase for subscribers. `astro check` 0 errors, build passes. |
| Indexing | Live `robots.txt` references `sitemap-index.xml`; sitemap lists 11 URLs; canonicals on every page; empty index pages auto-`noindex`; drafts excluded from production. |
| Structured data | `NewsArticle` with founder (`Person`) and company (`Organization`) under `about`, plus `citation` list; `Organization` and `WebSite` on home. |
| Social | Per-article 1200x630 OG image generated at build; Twitter cards. |
| Performance | Static HTML, self-hosted preloaded fonts, immutable asset caching. No third-party fonts. |
| Accessibility | Skip link, 44px tap targets, aria-live form messages, honeypot, AA-checked colour rules in the CSS. |
| Newsletter | Consent tick stored with timestamp, welcome email, SendGrid sync after DB save, webhook-driven unsubscribes/bounces, admin page, approve-then-send weekly job with once-only guard. |
| Editorial | Four published files (#001 to #003 plus the Amodei file), each 3,000+ words with 15+ listed sources; AI-assistance disclosed; corrections process. |

### Confirmed issues

1. **Analytics fires before consent.** GA4 (`G-1Z82S4LNVM`) loads unconditionally in `BaseLayout.astro`. For UK visitors, non-essential analytics cookies need prior consent under PECR. The privacy page discloses GA but disclosure is not consent. *Not changed: it is a product/legal decision (see section 2).*
2. **Editorial policy claims a practice that may not be happening.** "Before publication we check facts about the company and founder with them." Nothing in the repo shows this happens for the published files. Either do it (and say so per article) or soften the sentence. *Not changed: only you know.*
3. **Byline typed as a `Person`.** `author: "AI Founder Files"` was emitted as a person in JSON-LD. **Fixed** (now `Organization`).
4. **No breadcrumb markup or visible breadcrumbs.** **Fixed.**
5. **No topic architecture.** The four pillars did not exist in the site; `sector` was used as the section. **Fixed** (see section 3).
6. **Signup attribution was too coarse.** Every article placement recorded `file-subscribe`, so you could not tell which article converted. Also no GA conversion event. **Fixed.**
7. **Evidence labelling was convention-free.** Confirmed vs company-reported vs estimate was left to the writer. **Fixed** in the policy and template.
8. **Sitemap has no `lastmod`.** Minor; Google mostly ignores it unless accurate. Not changed.
9. **Published-article revenue claims need a second look.** File #003 relies partly on aggregator sources (Tech Startups, Tech Insider, Wikipedia) for headline figures such as revenue and valuation. Where the company's own post doesn't state a number, it should be labelled company-reported or independently reported in the text. Re-read before promoting it.

### Uncertainties

- Traffic, subscriber count, open/click rates, and whether the weekly send has run in production. Check Search Console, Supabase (`newsletter_subscribers`, `newsletter_sends`) and SendGrid.
- Whether SendGrid domain authentication, the event webhook, the Vercel deploy hook and GitHub secrets from the README checklist are complete.
- Whether the README "before launch" checklist is stale (the privacy page is already indexed and in the sitemap).
- Single opt-in is lawful with a stored consent record, but double opt-in protects sender reputation if junk signups appear.
- Source quality: the supabase `issues` bucket is public by design (unguessable path). Fine for a free newsletter, wrong for any paid product.

## 2. Prioritised plan

| # | Item | Status |
| --- | --- | --- |
| 1 | JSON-LD author type, breadcrumbs (visible and structured) | Done |
| 2 | Pillar model, `/topics/<pillar>/` hubs (noindex and out of sitemap until 3 articles) | Done |
| 3 | Per-article signup source + GA4 `newsletter_signup` events | Done |
| 4 | Evidence-label policy and template sections | Done |
| 5 | **Decide on GA consent** (cookie banner, or Consent Mode with `analytics_storage: denied` by default) | Needs your decision |
| 6 | **Resolve the "we check facts with the company" claim** | Needs your decision |
| 7 | Mark GA `newsletter_signup` as a Key Event in GA4; connect Search Console and Bing | Needs your account |
| 8 | Add `pillar` to new files; add a "Topics" link to nav once two hubs reach 3 articles | When content exists |
| 9 | Double opt-in only if junk signups appear | Conditional |
| 10 | Author page with real named byline(s) for E-E-A-T once a person is willing to be named | Needs your decision |

Not done, deliberately: no commit, push or deploy; no migration; no email sent; no change to published article text.

## 3. What changed in the code

- `src/lib/site.ts`: `PILLARS`, `DEFAULT_PILLAR`, `HUB_MIN_FILES`.
- `src/content.config.ts`: optional `pillar` (defaults to `founder-files`, so existing files still validate).
- `src/lib/files.ts`: `pillarOf`, `getFilesByPillar`.
- `src/pages/topics/[pillar].astro` (new): hub pages with `BreadcrumbList`.
- `src/pages/files/[slug].astro`: author as `Organization` when it's the publication, `BreadcrumbList`, visible breadcrumb, `articleSection` is the pillar, signup source `article:<slug>`.
- `src/layouts/PageLayout.astro`: optional `jsonLd` pass-through.
- `src/components/NewsletterBand.astro`, `SubscribeForm.astro`: `source` prop; GA events `newsletter_signup` and `newsletter_signup_error` (no email address sent to GA).
- `astro.config.mjs`: thin topic hubs excluded from the sitemap.
- `src/pages/editorial-policy.astro`: "How we label evidence".
- `src/content/files/sample-founder-file.md`: pillar field, evidence-label comment, customers/competitors/lessons sections.
- `src/content/files/maarten-road-exemptions.md` (draft): `pillar: how-they-built-it`.

## 4. Recommended first 10 flagship articles

Choose by *search demand you validate* and *source availability*. Each needs primary sources found before it is written.

| # | Working title | Pillar | Why it fits | Primary sources to find |
| --- | --- | --- | --- | --- |
| 1 | How AI startups get their first 100 customers | How They Built It | Evergreen, cites many companies, high link potential; the hub that internal links point to | Founder interviews, launch posts, S-1/filings where public |
| 2 | How AI companies price: seats, usage or outcomes | Business Models | Clear commercial intent, comparable across companies | Public pricing pages (archive them), earnings calls |
| 3 | Cursor / Anysphere: how a code editor became a business | Company | High-interest brand; distribution through developers | Company blog, funding announcements, founder interviews |
| 4 | Lovable: building a product company from Europe | Founder | Fast-growth story, small team | Company posts, founder interviews |
| 5 | Midjourney: a profitable AI company with no outside funding? | Business Model | Contrarian angle, only if its claims can be sourced | Founder interviews; label all revenue as reported |
| 6 | Perplexity: distribution vs the model makers | Company | Defensibility analysis | Company announcements, reporting |
| 7 | ElevenLabs: voice AI from a niche to infrastructure | Company | Developer-led distribution | Company blog, funding posts |
| 8 | Solo and tiny-team AI businesses: what is actually documented | How They Built It | Matches the "small teams" query theme; needs strict sourcing | Founder posts, acquisition announcements |
| 9 | What AI founders' first pitch decks and launches got right | Founder | Primary-source heavy | Published decks, launch threads |
| 10 | AI startups founded in 2026: a tracked list (living page, updated) | Business Models | Natural "updated" signal; revisit monthly | Funding announcements, Companies House / SEC filings |

Treat names as candidates: confirm each company has enough *public* material first, and check for conflicts (policy: no coverage of anyone who has paid you).

## 5. 90-day plan

Cadence: one flagship file a week (the current model), plus one smaller evergreen explainer every two weeks. Quality of sourcing beats volume.

- **Days 1 to 14: foundations.** Resolve section 2 items 5 to 7. Connect Search Console and Bing, submit the sitemap, mark `newsletter_signup` a key event. Confirm a `test` newsletter send reaches an inbox, and that DKIM/SPF pass.
- **Days 15 to 45: build the spine.** Publish flagship #1 (acquisition) and #2 (pricing) first, because every later file can link to them. Give each company file an explicit "Related business model" link. Set `pillar` on every file. When a pillar reaches three files its hub becomes indexable automatically.
- **Days 46 to 75: proof and distribution.** Share each file where founders already are (X, LinkedIn, Hacker News when the piece genuinely fits, relevant subreddits that allow it). Email the company and founder after publishing so factual corrections arrive early. Add the first "Updated" notes where facts changed.
- **Days 76 to 90: review.** Pull Search Console queries per file; double down on the pillar with impressions; retire or merge ideas with no demand. Decide on first monetisation step using the thresholds below.

## 6. Monetisation roadmap

Order by how little audience each needs and how little it risks trust. Thresholds are rules of thumb to calibrate against your own numbers, not facts.

| Stage | Model | Needs | Notes |
| --- | --- | --- | --- |
| 0 now | Nothing; grow the list | A reliable weekly send | Do not add ads to a list this small. |
| 1 | **Single sponsor slot in the newsletter** (clearly labelled "Sponsored") | A few hundred to ~1,000 engaged subscribers and a media kit with real click and open data. Open tracking is currently off by design, so decide whether to enable it for this. | Simplest credible first revenue. Audience fits AI tools, dev and founder services. Sponsor can't be a company you cover (your own policy). |
| 2 | **Selected affiliate links** for tools you would use anyway | Traffic to evergreen pieces (pricing, acquisition) | Disclose near the link and on the policy page. Only real programmes you have signed up for. |
| 3 | **Paid report / case-study collection** | A back catalogue of ~10 files and a list that has shown it opens and clicks | Bundle and update the files; the PDF pipeline already exists. Move PDFs behind access control first, because the bucket is public. |
| 4 | **Membership / premium tier** | A few thousand subscribers and demonstrable retention | Only worth it with distinct value (data, templates, interviews). Not before. |

Editorial independence rules to publish before the first sponsor: sponsors never review copy, are never covered for pay, and are always labelled.

## 7. Monthly KPIs

Report on the first of each month and keep the same definitions.

| KPI | Source | Note |
| --- | --- | --- |
| Organic clicks, impressions, avg position | Search Console | Per pillar and per file |
| Pages with at least one click | Search Console | Measures breadth of authority |
| Engaged sessions / engagement rate | GA4 | Only meaningful once consent handling is settled |
| New subscribers, net of unsubscribes | Supabase | Break down by `source` (e.g. `article:<slug>`, `home-hero`) |
| Signup conversion rate | GA4 `newsletter_signup` / sessions | Per placement |
| Newsletter unsubscribes, bounces, spam reports | SendGrid + Supabase status | Watch spam reports first |
| Newsletter click-through | SendGrid (needs click tracking on) | Currently off |
| Referring domains | Search Console links | Backlinks from sources you cite or contact |
| Corrections issued | Manual log | A trust metric |
| Revenue | Sponsor invoices / affiliate dashboards | Zero until stage 1 |
