# AI Founder Files

The site for [aifounderfiles.com](https://aifounderfiles.com): one AI founder and their company, in depth, every week.

Astro 7 (static output) · TypeScript · plain CSS with custom properties · no database, no CMS, no tracking scripts.

```bash
npm install
npm run dev        # http://localhost:4321
npm run build      # static site into dist/
npm run preview    # serve dist/ locally
npm run check      # type-check .astro and .ts files
npm run brand      # regenerate favicons + default OG image into public/
```

Requires Node 22.12 or newer.

---

## Add a new file (publish an article)

1. Copy `src/content/files/sample-founder-file.md` to a new file in the same folder.
2. Name it after the URL you want. `acme-ai.md` publishes at `/files/acme-ai/`. Lowercase, hyphens, no spaces.
3. Fill in the frontmatter (below) and write the body in Markdown. `.mdx` also works.
4. Set `draft: false`.
5. Commit and push. The host rebuilds and the file appears on the home page, archive, founders/companies indexes, RSS feed and sitemap. Its social image (`/og/<slug>.png`) is generated automatically.

**Drafts** (`draft: true`) show in `npm run dev` with a banner and `noindex`, and are **excluded from production builds**. Run `PUBLIC_SHOW_DRAFTS=false npm run dev` to preview the site exactly as production will show it.

The home page features the most recent file by `publishDate`, so publishing a newer file replaces it automatically. The "This week" label is worked out at build time (it reads "Latest file" if the newest file is more than 8 days old), so rebuild weekly or trigger a rebuild when you publish.

### Frontmatter fields

| Field | Type | Notes |
| --- | --- | --- |
| `title` | string | Headline. Shown in uppercase; write it in sentence case. |
| `standfirst` | string | One-line summary. Also the meta description and RSS description. |
| `fileNumber` | integer | Shown as `FOUNDER FILE #001`. |
| `publishDate` | date | `2026-10-04`. Newest first everywhere. |
| `updatedDate` | date, optional | Shows an "Updated" date and sets `dateModified` for search engines. |
| `author` | string | Byline. Becomes the `author` in the NewsArticle JSON-LD. |
| `founder.name`, `founder.role` | string | |
| `founder.linkedin` | URL, optional | |
| `company.name` | string | |
| `company.sector` | string | |
| `company.website` | URL, optional | |
| `company.founded` | string, optional | A year, or `Undisclosed`. |
| `company.hq` | string, optional | |
| `company.stage` | string, optional | e.g. `Seed`. |
| `company.funding` | string, optional | e.g. `£4.5m seed` or `Undisclosed`. |
| `company.businessModel` | string, optional | Adds a "MODEL" row to the fact box. |
| `tags` | string[] | Used to pick related files. |
| `heroImage` | `{ src, alt }`, optional | `src` is a path to an image relative to the file, e.g. `../../assets/acme.jpg`. `alt` is required. |
| `sources` | `{ title, url }[]` | Rendered as the "Sources" list at the end. |
| `draft` | boolean | Defaults to `false`. |

**Fact box:** any optional `company` field you leave out is shown as "Undisclosed". You can also write `Undisclosed` explicitly.

The build fails with a readable error if a required field is missing or a URL is malformed, so mistakes can't ship.

### Founders and companies pages

`/founders/` and `/companies/` are generated from the frontmatter of published files: one row per founder or company, linking to their file. If the same founder or company appears in more than one file, the newest file is linked. There is no separate directory to maintain.

---

## Connect the newsletter

The signup form lives in one place, `src/components/SubscribeForm.astro`, and is used on the home page, every article and `/subscribe/`. Its endpoint comes from an environment variable.

1. Copy `.env.example` to `.env` and set `PUBLIC_NEWSLETTER_ACTION` to your provider's form endpoint.
2. For production, set the same variable in your host's environment settings (see below) and redeploy. `PUBLIC_` variables are read **at build time**, so a change needs a rebuild.

**Buttondown:** use `https://buttondown.com/api/emails/embed-subscribe/YOUR-USERNAME`. The form already sends an `email` field.

**Beehiiv:** use the form-post URL from Beehiiv's embeddable subscribe form for your publication, if your plan offers it. If it doesn't, Beehiiv's API needs a secret key, which must run server-side (for example a small Vercel serverless function) and not in this static site. That function isn't included.

Behaviour: the form validates the address in the browser, then posts it with `fetch`. Most providers don't return CORS headers, so the browser can't read the response. A resolved request shows the success message, and a network failure shows the error message. If you want strict confirmation, use the provider's hosted "thanks" page by posting the form normally (remove the script in `SubscribeForm.astro`).

If `PUBLIC_NEWSLETTER_ACTION` is empty, the form still validates but reports "Signup isn't connected yet" instead of pretending to subscribe.

---

## Deploy to Vercel (with aifounderfiles.com)

The repo is at `github.com/davidphilipstark1993/aifounderfiles`. `vercel.json` already sets the build command, output folder and trailing-slash URLs, and `package.json` pins Node 22.12+. No adapter is needed because the site is fully static.

1. In Vercel choose **Add New → Project**, import the GitHub repo and leave the detected settings (Framework: Astro, Build: `npm run build`, Output: `dist`).
2. Under **Environment Variables** add `PUBLIC_NEWSLETTER_ACTION` with your provider's endpoint (see above). It's read at build time, so redeploy after changing it.
3. Deploy. You'll get a `*.vercel.app` URL to check first.
4. **Settings → Domains → Add** `aifounderfiles.com`, and add `www.aifounderfiles.com` too. Vercel shows the exact DNS records to create.
5. Create those records where the domain is registered (or wherever its DNS is managed). Use the values Vercel displays, typically an `A` record for the apex and a `CNAME` for `www`. DNS changes can take from a few minutes to a few hours.
6. In **Domains**, set one of the two to redirect to the other, so there is a single canonical hostname. The site's canonical URLs and sitemap use `https://aifounderfiles.com`, so make the apex the primary.
7. After it's live, submit `https://aifounderfiles.com/sitemap-index.xml` in Google Search Console and Bing Webmaster Tools.

Every push to `main` redeploys automatically, so publishing a file is: add the Markdown, commit, push. Pull requests get their own preview URLs, which is a good way to proof an article first. (Drafts never appear in any Vercel build.)

### Other hosts

The output is plain static files in `dist/`, so Netlify and Cloudflare Pages work too: build command `npm run build`, output directory `dist`, `NODE_VERSION=22`, and the same `PUBLIC_NEWSLETTER_ACTION` variable. On Cloudflare Pages the trailing-slash behaviour is the default, and on Netlify enable "Pretty URLs".

---

## Before launch checklist

- [ ] Replace the placeholders on `/privacy/` (marked `[DRAFT — review before launch]`), have it reviewed, then remove `noindex` from `src/pages/privacy.astro` and the `/privacy/` filter in the sitemap config in `astro.config.mjs`.
- [ ] Set up the mailboxes in `src/lib/site.ts` (`hello@` and `corrections@aifounderfiles.com`), or change them.
- [ ] Read `/editorial-policy/` and `/about/` and edit the wording to match how you actually work. The fact-checking section is a draft. Add the "Who's behind it" paragraph on `/about/`.
- [ ] Set `PUBLIC_NEWSLETTER_ACTION` in Vercel's environment variables.
- [ ] Publish file #001 (`draft: false`). Until then the home page, archive and indexes show "coming soon" empty states.

---

## How it's built

```
src/
  content.config.ts        zod schema for the "files" collection
  content/files/           one Markdown/MDX file per article
  components/              Logo, Header, Footer, FactBox, FileCard, SubscribeForm, NewsletterBand, Arrow
  layouts/                 BaseLayout (head, SEO, JSON-LD, fonts), PageLayout (text pages)
  lib/                     files.ts (queries, dates, indexes), og.ts (social cards), site.ts
  pages/                   home, files/[slug], founders, companies, archive, subscribe, about,
                           editorial-policy, privacy, 404, rss.xml, og/[slug].png
  styles/                  tokens.css (brand tokens), global.css
scripts/
  build-brand-assets.mjs   favicon + default OG generator (text outlined to paths)
  lib/outline.mjs          text-to-path helper shared with og.ts
public/                    favicons, manifest, og-default.png, robots.txt
brand/                     the four brand sheets (reference only, not served)
```

**Brand rules baked into the CSS**

- Tokens live in `src/styles/tokens.css` and match the brand sheet exactly. `--white`, `--ink-muted` and `--ink-rule` are supporting neutrals, not brand colours.
- Signal (`#C7431D`) is used for buttons, links, the logo's FILES and small labels, and never on ink (use `--signal-light`) or on manila (3.6:1 fails AA).
- Headlines: Archivo 900, `font-stretch: 85%`, uppercase, tight tracking (`.display`). Labels and fact boxes: JetBrains Mono, uppercase, letter-spaced (`.label`). Body: Source Serif 4.

**Logo:** `<Logo variant="stacked | horizontal | mark" theme="light | dark" />`. Size it with `--logo-size` on the element or a parent.

**Fonts** are self-hosted through `@fontsource` packages, so there are no requests to Google Fonts.

**Social images.** `/og/<slug>.png` is generated per article at build time with satori + resvg. It uses static instances of Archivo (900, width 85 and 100) in `src/assets/fonts/`, cut from the variable font. `npm run brand` regenerates `favicon.svg`, the PNG icons and `og-default.png` with the text converted to outlines, so those files don't depend on any font.

**SEO.** Each page has its own title, description and canonical URL (`https://aifounderfiles.com/...`), Open Graph and Twitter tags. The home page has `Organization` and `WebSite` JSON-LD. Articles have `NewsArticle` JSON-LD with the author as `Person` and the founder (`Person`) and company (`Organization`) under `about`. Also included: `sitemap-index.xml`, `rss.xml`, `robots.txt`.

**Known limitation.** `npm audit` reports a moderate `fflate` advisory pulled in by `satori`. It's a ZIP parser that isn't used on untrusted input here (satori only runs at build time on your own content).
