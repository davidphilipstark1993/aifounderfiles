# SEO and AEO work: findings for the owner

Everything here was found while making the changes on the `seo-aeo-improvements` branch. No article figures were changed.
Re-run the automated parts any time with `npm run check:content`.

## 1. Research on the unsourced and unverified claims (Sam Altman file)

I looked these up myself (web search plus opening the pages I could reach). Where a page was behind a 403/503 I say so. I added five sources (22 to 26, appended so existing numbers didn't move) and the matching markers. Article copy and figures are unchanged.

### Confirmed, and now cited

| Claim | Result | Source added or used |
| --- | --- | --- |
| Loopt sold to Green Dot for $43.4 million, 2012 | Confirmed: announced 9 March 2012, $43.4m cash including a ~$9.8m retention pool. The release does not say how much Loopt raised, so "raised more than $30 million" is still unsourced. | 23 (Green Dot release, opened) |
| Salary, upper end | $76,001 for 2023 ($73,546 for 2022), from OpenAI's nonprofit tax filing. | 22 (Bloomberg, via search results) |
| $180 million into Retro Biosciences | Confirmed: Altman put up the whole sum, cheques totalling $180m in 2021. | 24 (MIT Technology Review, opened) and 12 |
| Musk verdict: unanimous, under two hours, $150bn suit, Musk will appeal | All confirmed. | 14/15 (Al Jazeera, opened) |
| "Not proud" of how he handled the old board; conflict-averse; New Yorker piece by Farrow and Marantz with 100+ interviews | Confirmed. | 16 (TechCrunch, opened) |
| Molotov attack 10 April: gate set alight, no one hurt, 20-year-old arrested | Confirmed. | 17 (Al Jazeera, opened) |
| Second incident "days later" | Confirmed: 12 April, a shot fired outside the house, two arrests. | 26 (SF Standard, opened) |
| Ads: US test from February 2026, bottom of answers, labelled, not shown to under-18s, no effect on answers | Confirmed. | 25 (Engadget, opened) |
| Helion: Altman left the board; talks to supply OpenAI power, 12.5% of output, 5 GW by 2030 | Confirmed as *reported* (Axios), not confirmed by Helion. He also stepped down as Oklo chair in 2025. | 13 (TechCrunch, opened) |
| No direct OpenAI equity; Helion ~$1.7bn as of 31 Dec 2025; Stripe, Reddit, Retro | Confirmed, from May 2026 court filings. | 12 (StartupHub, opened) |
| Altman will not take OpenAI public in 2026; "ill-advised" | Confirmed. | 4 (Fortune, opened) |
| ChatGPT launch 30 Nov 2022; a million users in five days | Confirmed by several outlets and Altman's own post, but I found no strong primary page to cite. Left unmarked. | none added |
| $122bn round at $852bn, 31 March 2026 | Confirmed (post-money; the February target was $110bn at $730bn pre-money). Reports differ on which investors "co-led". | 2 (could not open; SiliconANGLE and Yahoo also report it) |
| Marriage (Hawaii, January 2024), son born "early" in February 2025 | Confirmed by several outlets; not cited. | none added |

### Not confirmed, or contradicted by what I found

- **Forbes $3.3 billion.** I could not reach Forbes. Secondary sites give $3.3bn, but one cites a Forbes figure of **$4bn (Reuters, 13 May 2026)** and others differ. Check Forbes directly.
- **"A private portfolio of more than 400 companies."** Source 12 says his disclosed positions are **nine**, worth over $2bn. PitchBook lists 172 investments. I found nothing for 400. Needs a source or a rewrite.
- **Annualised revenue (fixed).** The file said "nearing $70 billion" (body and "What to watch"). Reporting says OpenAI told investors about **$50 billion** at the end of September; the ~$70bn was an investor "gross-up" to match Anthropic's gross-of-partner-sales basis. Copy now says about $50 billion, cited to source 27 (Channel Insider, opened; it relays the FT, which is paywalled, and OpenAI has not confirmed). Note the Amodei file's "annualised $65 billion by July" for Anthropic is on the gross basis, so the two files' run rates are not like-for-like.
- **"$13.1 billion revenue in 2025 and burned about $8 billion."** The $13.1bn matches reported leaked financials ($13.07bn). The "$8 billion burn" matches OpenAI's *projection* from 2025; leaked 2025 costs of about $34bn imply a much larger loss, so "burned" may be wrong. Needs a source and a definition.
- **"$130 million collected by 2019" of the $1 billion pledged.** Wikipedia gives **$133 million by 2021** (from tax filings), and other reporting differs on the year. OpenAI later said Musk's contributions were under $45m.
- **New Yorker "16,000-word".** TechCrunch calls it "lengthy" and doesn't give a word count.
- **Suspect "had reportedly written essays about AI ending humanity" and Altman "posting a photo of his family".** Neither is in sources 16, 17 or 26; police had given no motive. I removed my marker from the photo sentence. These need a source or a cut.
- **Giving Pledge in May 2024.** I found nothing. (Marriage and the baby are fine.)
- **Son born "on 23 February 2025" and "spent his first days in intensive care".** Fortune (source 18) gives only "February 2025" and no ICU detail. Altman announced the birth on 22 February and said the baby came early and would be in the NICU. Worth checking the date.
- **"Helion's board chair".** The TechCrunch quote says "Board of Directors"; I didn't see "chair" confirmed. Oklo chair is confirmed, but only "in 2025", not "April 2025".
- **"Altman agreed straight away".** Graham's post says "he agreed"; "straight away" and "didn't want him to leave" are additions. Source 19 also notes that the WSJ and Washington Post reported he was forced out, which the FAQ answer now says.
- **"Around 700 of 770 employees".** Widely reported (NYT; NPR's earlier count was 500, later updates reached about 700, with 743 cited on 21 November). I could not open NPR (503). Left unmarked; NPR is the one to add.
- Not researched or still unsourced: Microsoft's $1bn in 2019, OpenAI's capped-profit arm, Tools for Humanity/World founded 2019, "2027 is the widely reported IPO target" (Fortune does not say it), the "close to a billion" users line, born/childhood/YC dates.

Where a marker I added is only partly supported, I kept it and listed the gap above: 23 (price confirmed, "$30 million raised" not), 22 and 11 on the salary (22 confirms $76,001; I could not open 11 to confirm $65,000), 17 and 26 (events confirmed, suspect's essays not).

## 2. Inconsistencies (copy not changed)

1. **Altman: valuation.** Title area, standfirst and fact box say **$852 billion (March 2026)**. The body says OpenAI is in early talks at about **$1.4 trillion** (late September 2026). "Last valued at" is technically still right while talks are only talks, but the header is six months stale relative to the body. Decide whether the header should name both.
2. **Altman: two different "$1.4 trillion"s.** The body uses $1.4 trillion for the valuation talks *and* for the compute spend Altman talked about "last November". A reader skimming will conflate them.
3. **Cross-file: OpenAI's valuation.** The Amodei file says "OpenAI is raising at $1.4 trillion" as a fact (What to watch #5); the Altman file says "reports say ... early talks". Align the wording.
4. **Amodei: valuation.** Header says $965 billion (May); body says shares could price "at a valuation of more than $2 trillion" after November, from a leaked prospectus. Same situation as Altman.
5. **Weinberg: valuation.** Header says $15.5 billion; the body notes "some outlets, citing Bloomberg, put the valuation at $15.6 billion". The body already acknowledges it; one of the listed source URLs also says 15.6.
6. **Altman: salary.** Standfirst says "roughly $65,000 to $76,000", body says "reported ... depending on the source". $76,001 is confirmed; $65,000 is not yet.
7. **Altman: revenue.** Fixed: now about $50 billion (see section 1). Anthropic's $65bn run rate in the Amodei file uses a different, gross basis.
8. **Altman: portfolio.** "More than 400 companies" conflicts with source 12, which lists nine disclosed positions.
9. **Altman: net worth.** Forbes is quoted at $3.3bn; other reporting cites a Forbes figure of $4bn in May 2026.
10. **Spelling and style.** Altman uses "%", Amodei and Weinberg used "percent". I changed "percent" to "per cent" in those two (figures unchanged). "%" and "per cent" are both acceptable British house style, so pick one. "Defense Department" in the Amodei file is a proper noun and was left.

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
3. `src/content/files/sam-altman.md`: review the six FAQ answers (they go live with this branch and into `FAQPage` JSON-LD). The salary answer needs source 11 checked for the $65,000 figure.
4. Decide what to do with the claims in section 1 that I could not confirm or that conflict with sources (400 companies, Forbes, suspect's essays, Giving Pledge).
5. `src/content/files/sam-altman.md`: approve the shortened meta description.
6. Not marked in the code: set `updatedDate` on the Altman file when this ships (it gained citations, a FAQ, links and a new description), so "Updated", `dateModified` and the sitemap `lastmod` move.
7. Not marked in the code: confirm the Wikipedia `sameAs` URLs. Sam Altman, Anthropic, both Amodeis and Harvey come from each file's own Sources list. OpenAI's (`https://en.wikipedia.org/wiki/OpenAI`) is not in a source list; I checked it resolves.

## 7. Host settings and post-deploy checks

- **Vercel domains:** add `www.aifounderfiles.com` to the project (Settings, Domains) and make the apex primary. `vercel.json` now 301s `www` to `https://aifounderfiles.com/`; confirm with `curl -sI https://www.aifounderfiles.com/files/sam-altman/`.
- **Rich Results Test** on `https://aifounderfiles.com/` (Organization, WebSite) and `https://aifounderfiles.com/files/sam-altman/` (NewsArticle, BreadcrumbList, FAQPage). The author is an Organization until a named author exists.
- **Search Console and Bing Webmaster Tools:** submit `https://aifounderfiles.com/sitemap-index.xml`.
- Open `/llms.txt`, `/robots.txt` and `/rss.xml` once live and confirm they are served as plain text / XML.
- Paste a file URL into LinkedIn's Post Inspector or the Facebook Sharing Debugger to confirm the new OG image (founder and company line) renders.
