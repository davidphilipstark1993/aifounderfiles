# SEO and AEO work: findings for the owner

Everything here was found while making the changes on the `seo-aeo-improvements` branch. No article figures were changed.
Re-run the automated parts any time with `npm run check:content`.

## 1. Citations I could not match to a listed source (Sam Altman file)

The 21 listed sources were matched to claims by **title only**; I did not open the pages. Please check each marker I added (28 of them) against its source, especially the ones in the second table.

### Numeric claims with no matching source

| Claim | Where | Closest candidate |
| --- | --- | --- |
| Salary "$65,000 to $76,000" | intro, FAQ | none listed |
| "Forbes put [his fortune] at about $3.3 billion" | intro | #11 (NewsNation net worth) might carry it; Forbes itself is not listed |
| "$0 ... according to Forbes and the evidence in his own court case" | short version | #12 says "no OpenAI equity" but the Forbes attribution is not listed |
| Loopt "raised more than $30 million" and sold to Green Dot in 2012 "for $43.4 million" | The founder | #1 (Wikipedia) is the only plausible one; not confirmed |
| OpenAI launched Dec 2015 "with $1 billion in pledges"; "only about $130 million ... collected" by 2019 | The problem, funding list | none listed |
| Microsoft invested $1 billion in 2019 | The problem, funding list | none listed |
| "Around 700 of OpenAI's roughly 770 employees" signed the letter | Five days in November | #21 (YourStory timeline) probably; marker is on the paragraph's last sentence, not this one |
| "Early stakes in Stripe and Reddit ... Retro Biosciences, where he put in $180 million" | The funding | none listed |
| "More than 400 companies" in his portfolio | The funding | #12 might |
| OpenAI "$13.1 billion in revenue in 2025 and burned about $8 billion" | The business model | none listed |
| "Annualised revenue ... nearing $70 billion" | The business model, What to watch | none listed |
| "Close to a billion" ChatGPT users | The product | none listed (#9 covers 900 million) |
| Musk "seeking up to $150 billion"; "Musk has said he will appeal" | What could go wrong | #14/#15 may carry it |
| "A million people signed up in five days" (ChatGPT) | The product | none listed |
| Ads "began testing in the US in February ... not shown to under-18s" | The business model | #8 covers the $1 billion run rate only |
| Oklo "chaired until April 2025"; Tools for Humanity co-founded 2019 | The business model | none listed |
| "16,000-word investigation ... more than a hundred interviews" (New Yorker) | What could go wrong | #16 covers Altman's response, not the article's size |
| 2027 as "the widely reported" IPO target | What to watch | none listed |
| Date and biography claims (born 22 April 1985, married January 2024, Giving Pledge May 2024, son born 23 February 2025, Reddit CEO for eight days, left YC March 2019) | The founder | #1 (Wikipedia) probably; not marked |

The script lists these sentence by sentence (`npm run check:content`, section "Sentences with a number and no [^n] citation"). The Amodei and Weinberg files have no inline markers yet, so every numeric sentence in them is listed there.

### Markers I added that are plausible but unverified

- #21 on the November 2023 sequence (fired call, five days, new board, Sutskever regret): matches the source's subject, but I haven't confirmed each detail.
- #16 on "accepting that he handles conflict badly" and on the post about the family: the source is Altman's response to the New Yorker piece; the "not proud" quote in "Five days in November" is **not** marked.
- #12 on "no direct OpenAI equity", the $1.7 billion Helion stake and "(as of the end of 2025)".
- #10 on the 26% / 27% split.
- #5 on the $600 billion compute target and on "down from the $1.4 trillion ... last November".
- #14 and #15 together on the jury verdict "in under two hours".

## 2. Inconsistencies (copy not changed)

1. **Altman: valuation.** Title area, standfirst and fact box say **$852 billion (March 2026)**. The body says OpenAI is in early talks at about **$1.4 trillion** (late September 2026). "Last valued at" is technically still right while talks are only talks, but the header is six months stale relative to the body. Decide whether the header should name both.
2. **Altman: two different "$1.4 trillion"s.** The body uses $1.4 trillion for the valuation talks *and* for the compute spend Altman talked about "last November". A reader skimming will conflate them.
3. **Cross-file: OpenAI's valuation.** The Amodei file says "OpenAI is raising at $1.4 trillion" as a fact (What to watch #5); the Altman file says "reports say ... early talks". Align the wording.
4. **Amodei: valuation.** Header says $965 billion (May); body says shares could price "at a valuation of more than $2 trillion" after November, from a leaked prospectus. Same situation as Altman.
5. **Weinberg: valuation.** Header says $15.5 billion; the body notes "some outlets, citing Bloomberg, put the valuation at $15.6 billion". The body already acknowledges it; one of the listed source URLs also says 15.6.
6. **Altman: salary.** Standfirst says "roughly $65,000 to $76,000", body says "reported ... depending on the source", FAQ repeats the body. No source is listed for any of them.
7. **Spelling and style.** Altman uses "%", Amodei and Weinberg used "percent". I changed "percent" to "per cent" in those two (figures unchanged). "%" and "per cent" are both acceptable British house style, so pick one. "Defense Department" in the Amodei file is a proper noun and was left.

## 3. Heading proposals (not applied)

Generic headings in the Altman file, with entity-specific alternatives. The sample-issue component on the home page reads article headings for its section list, so check it if you change them.

| Now | Proposed |
| --- | --- |
| The short version | Sam Altman and OpenAI: the short version |
| The founder | Who is Sam Altman? |
| The problem | The problem OpenAI set out to solve |
| The product | ChatGPT and OpenAI's products |
| Five days in November | Five days in November: how OpenAI's board fired and rehired Sam Altman |
| The funding | OpenAI's funding |
| The business model | OpenAI's business model |
| What could go wrong | What could go wrong for OpenAI |
| What to watch | What to watch next at OpenAI |

The Amodei and Weinberg files follow the same template, so the same pattern applies ("Anthropic's funding", "Harvey's business model").

## 4. Meta descriptions

- Altman: **applied** as a new `description` field (148 characters, was 211): "Sam Altman runs OpenAI, maker of ChatGPT, on a reported salary of $65,000 to $76,000, with no direct stake in a company last valued at $852 billion." The standfirst on the page is unchanged.
- Proposed, not applied (both currently fall back to a 221- and 206-character standfirst):
  - Amodei (145): "Dario and Daniela Amodei left OpenAI to build Anthropic, now valued at $965 billion, fighting the Pentagon and heading for a possible record IPO."
  - Weinberg (146): "Winston Weinberg and his roommate tested GPT-3 on a hundred Reddit questions and emailed OpenAI. Four years on, Harvey is valued at $15.5 billion."

## 5. Things the brief assumed that were different

- "The File" was already a `<dl>`. The real issue was the dot leaders being literal characters inside each `<dt>`; they are now drawn in CSS.
- `updatedDate`, `dateModified`, NewsArticle, publisher with logo, `citation`, per-file OG images, a `Sitemap:` line, RSS `dc:creator` and home-page `Organization` + `WebSite` already existed. I kept the field name `updatedDate` instead of adding `updated`.
- Astro 7 renders Markdown with Sätteri, so remark plugins don't load. The citation plugin is a Sätteri plugin; `@astrojs/markdown-satteri` and `satteri` are now direct dependencies. It works for `.md`, not `.mdx`.
- "Founder and company hubs" are the `/founders/` and `/companies/` index pages. There are no per-entity pages and I didn't add any (URLs unchanged). Say if you want `/founders/<slug>/` and `/companies/<slug>/`.
- Related files already existed; they now also weigh a shared company or founder.
- Early reads are in the sitemap. Their `lastmod` is the last git commit touching the file, never a future date.

## 6. Every TODO(owner)

1. `src/content/authors/editorial.md`: add the real author (name, `type: person`, bio, photo, LinkedIn, X), then point each file's `author` at it. Until then bylines read "By AI Founder Files" and the schema author is an Organization.
2. `src/pages/about.astro`: add a sentence or two about the named author (the old "Who's behind it" gap).
3. `src/content/files/sam-altman.md`: review the six FAQ answers (they go live with this branch and into `FAQPage` JSON-LD).
4. `src/content/files/sam-altman.md`: add a source for the salary figure (and the FAQ answer that repeats it).
5. `src/content/files/sam-altman.md`: approve the shortened meta description.
6. Not marked in the code: set `updatedDate` on the Altman file when this ships (it gained citations, a FAQ, links and a new description), so "Updated", `dateModified` and the sitemap `lastmod` move.
7. Not marked in the code: confirm the Wikipedia `sameAs` URLs. Sam Altman, Anthropic, both Amodeis and Harvey come from each file's own Sources list. OpenAI's (`https://en.wikipedia.org/wiki/OpenAI`) is not in a source list; I checked it resolves.

## 7. Host settings and post-deploy checks

- **Vercel domains:** add `www.aifounderfiles.com` to the project (Settings, Domains) and make the apex primary. `vercel.json` now 301s `www` to `https://aifounderfiles.com/`; confirm with `curl -sI https://www.aifounderfiles.com/files/sam-altman/`.
- **Rich Results Test** on `https://aifounderfiles.com/` (Organization, WebSite) and `https://aifounderfiles.com/files/sam-altman/` (NewsArticle, BreadcrumbList, FAQPage). The author is an Organization until a named author exists.
- **Search Console and Bing Webmaster Tools:** submit `https://aifounderfiles.com/sitemap-index.xml`.
- Open `/llms.txt`, `/robots.txt` and `/rss.xml` once live and confirm they are served as plain text / XML.
- Paste a file URL into LinkedIn's Post Inspector or the Facebook Sharing Debugger to confirm the new OG image (founder and company line) renders.
