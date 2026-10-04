# AI Founder Files

The site for [aifounderfiles.com](https://aifounderfiles.com): one AI founder and their company, in depth, every week.

Astro 7 (static output) · TypeScript · plain CSS with custom properties · no CMS and no tracking scripts. The only database is the newsletter subscriber list (Supabase), and the only server code is two small Vercel Functions for signup.

```bash
npm install
npm run dev        # http://localhost:4321
npm run build      # static site into dist/
npm run preview    # serve dist/ locally
npm run check      # type-check .astro and .ts files
npm run brand      # regenerate favicons + default OG image into public/
npm run newsletter:dry-run   # render this week's email and report, sending nothing
```

Requires Node 22.12 or newer.

---

## Add a new file (publish an article)

1. Copy `src/content/files/sample-founder-file.md` to a new file in the same folder.
2. Name it after the URL you want. `acme-ai.md` publishes at `/files/acme-ai/`. Lowercase, hyphens, no spaces.
3. Fill in the frontmatter (below) and write the body in Markdown. `.mdx` also works.
4. Set `draft: false`.
5. Commit and push. The host rebuilds and the file appears on the home page, archive, founders/companies indexes, RSS feed and sitemap, and the next Sunday send emails it to subscribers. Its social image (`/og/<slug>.png`) is generated automatically.

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

## The newsletter (SendGrid + Supabase + GitHub Actions)

Built the same way as listentruecrime.com. Everything runs without a server of your own:

| Piece | Where | What it does |
| --- | --- | --- |
| Signup form | `src/components/SubscribeForm.astro` | Validates, requires a consent tick, posts to `/api/subscribe`. Shows real success and error messages. |
| `POST /api/subscribe` | `api/subscribe.ts` (Vercel Function) | Saves the subscriber to Supabase **first**, then adds them to your SendGrid list, then sends the welcome email. A SendGrid failure never loses the subscriber. Re-subscribing lifts an earlier unsubscribe. |
| `POST /api/sendgrid-webhook` | `api/sendgrid-webhook.ts` (Vercel Function) | Verifies SendGrid's signature, then marks people unsubscribed, bounced or suppressed so later sends skip them. |
| Weekly send | `scripts/newsletter/weekly-send.ts` + `.github/workflows/weekly-newsletter-send.yml` | Sundays 08:00 UTC: emails the newest published file to every active subscriber, once. |
| Email design | `lib/newsletter/templates.ts` | Welcome email and the weekly issue (headline, standfirst, "THE FILE" fact box, button), in the brand colours. |
| Data | `supabase/migrations/001_newsletter.sql` | `newsletter_subscribers` and `newsletter_sends`. |

**Publishing is the approval.** Set `draft: false` on a file and push. On Sunday the Action finds the newest published file that hasn't been emailed and sends it. If there is nothing new, nothing is sent and you get an email saying so.

### What the weekly send will and won't do

- It sends **one file per run**, the newest by `publishDate` (then `fileNumber`).
- A file is **never sent twice**: each send is recorded in `newsletter_sends` (unique per file) before any email goes out.
- If a send stops part-way (for example a SendGrid error), nothing more goes out until you re-run the workflow with **resume** ticked, which emails only the people not yet reached.
- It refuses to send a file published more than 10 days ago, so a late first run can't blast an old article. Use the `slug` input to send one deliberately.
- You get an alert email for every outcome: sent, nothing new, already sent, failed.

### Try it without emailing anyone

In GitHub: **Actions → Weekly Newsletter Send → Run workflow**. Choose a mode:

- `dry-run` (default): renders the email and reports what it would send.
- `test`: sends one copy to `ADMIN_EMAILS` only, so you can see it in your inbox.
- `send`: emails every active subscriber now.

Locally: `npm run newsletter:dry-run`.

### One-time setup

**1. Supabase.** Create a new project for AI Founder Files. In **SQL Editor** run `supabase/migrations/001_newsletter.sql`. From **Project Settings → API** copy the project URL and the `service_role` key (keep that secret; it must never go in client code).

**2. SendGrid** (your existing account is fine; keep AI Founder Files in its own list and group).
- **Sender authentication:** authenticate `aifounderfiles.com` (Settings → Sender Authentication → Domain). SendGrid gives you CNAME records to add in Namecheap's Advanced DNS. Without this, mail to Gmail/Outlook is likely to land in spam or be rejected.
- **Marketing → Contacts → Lists:** create a list "AI Founder Files" and note its id.
- **Settings → Unsubscribe Groups:** create a group "AI Founder Files weekly" and note its id (this powers one-click unsubscribe and the `List-Unsubscribe` header).
- **Settings → API Keys:** create a key with Mail Send and Marketing permissions.
- **Settings → Mail Settings → Event Webhook:** HTTP POST URL `https://aifounderfiles.com/api/sendgrid-webhook/` (the trailing slash matters: the site forces slashes and SendGrid will not follow the redirect); tick *Unsubscribe*, *Group Unsubscribe*, *Bounced* and *Spam Report*; switch on **Signature Verification** and copy the public key it shows. Enable the webhook.

**3. Vercel → Settings → Environment Variables** (Production), then redeploy:
`SUPABASE_URL`, `SUPABASE_SERVICE_ROLE_KEY`, `SENDGRID_API_KEY`, `SENDGRID_FROM_EMAIL`, `SENDGRID_FROM_NAME`, `SENDGRID_LIST_ID`, `SENDGRID_UNSUBSCRIBE_GROUP_ID`, `SENDGRID_WEBHOOK_VERIFICATION_KEY`, `ADMIN_EMAILS`. (See `.env.example`.)

**4. GitHub repo secrets** (Settings → Secrets and variables → Actions) for the weekly send:
`SUPABASE_URL`, `SUPABASE_SERVICE_ROLE_KEY`, `SENDGRID_API_KEY`, `SENDGRID_FROM_EMAIL`, `SENDGRID_FROM_NAME`, `SENDGRID_UNSUBSCRIBE_GROUP_ID`, `ADMIN_EMAILS`. With the GitHub CLI each one is `gh secret set NAME` (it prompts for the value, so it never lands in your shell history).

**5. Check it end to end:** subscribe with your own address on the live site (you should see the success message, get the welcome email, and see a row in Supabase), then run the workflow in `test` mode.

### Notes

- **Local development:** `npm run dev` serves the pages but not `/api/*`; the form then says signup isn't available. To exercise the functions locally use `npx vercel dev` with a `.env` file.
- **Consent:** the form requires an explicit tick, and the time is stored (`consent_at`) as proof. Signup is single opt-in with a welcome email, like LTC. If you want double opt-in later, the welcome email is the place to add a confirmation link.
- **Tracking:** no open or click tracking is switched on by this code. Leave SendGrid's tracking settings off to keep it that way.
- **Spam protection:** a hidden honeypot field catches simple bots. If you see junk signups, add Cloudflare Turnstile or hCaptcha to the form.

---

## Deploy to Vercel (with aifounderfiles.com)

The repo is at `github.com/davidphilipstark1993/aifounderfiles`. `vercel.json` already sets the build command, output folder and trailing-slash URLs, and `package.json` pins Node 22.12+. No adapter is needed because the site is fully static.

1. In Vercel choose **Add New → Project**, import the GitHub repo and leave the detected settings (Framework: Astro, Build: `npm run build`, Output: `dist`).
2. Under **Environment Variables** add the newsletter variables listed in the newsletter section above, then redeploy.
3. Deploy. You'll get a `*.vercel.app` URL to check first.
4. **Settings → Domains → Add** `aifounderfiles.com`, and add `www.aifounderfiles.com` too. Vercel shows the exact DNS records to create.
5. Create those records where the domain is registered (or wherever its DNS is managed). Use the values Vercel displays, typically an `A` record for the apex and a `CNAME` for `www`. DNS changes can take from a few minutes to a few hours.
6. In **Domains**, set one of the two to redirect to the other, so there is a single canonical hostname. The site's canonical URLs and sitemap use `https://aifounderfiles.com`, so make the apex the primary.
7. After it's live, submit `https://aifounderfiles.com/sitemap-index.xml` in Google Search Console and Bing Webmaster Tools.

Every push to `main` redeploys automatically, so publishing a file is: add the Markdown, commit, push. Pull requests get their own preview URLs, which is a good way to proof an article first. (Drafts never appear in any Vercel build.)

### Other hosts

The pages are plain static files in `dist/`, but signup and the SendGrid webhook are Vercel Functions in `api/`. Moving to Netlify or Cloudflare would mean porting those two small files to that host's function format.

---

## Before launch checklist

- [ ] Replace the placeholders on `/privacy/` (marked `[DRAFT — review before launch]`), have it reviewed, then remove `noindex` from `src/pages/privacy.astro` and the `/privacy/` filter in the sitemap config in `astro.config.mjs`.
- [ ] Set up the mailboxes in `src/lib/site.ts` (`hello@` and `corrections@aifounderfiles.com`), or change them.
- [ ] Read `/editorial-policy/` and `/about/` and edit the wording to match how you actually work. The fact-checking section is a draft. Add the "Who's behind it" paragraph on `/about/`.
- [ ] Complete the newsletter one-time setup above (Supabase, SendGrid domain authentication, Vercel env vars, GitHub secrets) and run a `test` send.
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
api/                       Vercel Functions: subscribe.ts, sendgrid-webhook.ts
lib/newsletter/            shared by the functions and the weekly send: SendGrid, Supabase, email templates
supabase/migrations/       001_newsletter.sql (subscriber + send-log tables)
.github/workflows/         weekly-newsletter-send.yml (Sundays 08:00 UTC)
scripts/
  build-brand-assets.mjs   favicon + default OG generator (text outlined to paths)
  lib/outline.mjs          text-to-path helper shared with og.ts
  newsletter/weekly-send.ts  the Sunday send
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
