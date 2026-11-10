---
title: "Sample blog post (draft — not for publication)"
description: "A template for daily blog posts on AI Founder Files. This entry is a draft and will not appear on the live site."
publishDate: 2026-11-10
author: "AI Founder Files"
tags: ["sample", "draft"]
sources:
  - title: "AI Founder Files, about page"
    url: "https://aifounderfiles.com/about/"
relatedFiles: ["sam-altman"]
draft: true
---

This is a **draft sample post**. It exists only so the new `blog` collection has a copy-me starter. It is excluded from production builds, the sitemap and the RSS feed.

To publish a real post, copy this file to `src/content/blog/{slug}.md`, fill in the frontmatter, write the body, set `draft: false`, and push to `main`. The post will appear at `/blog/{slug}/`, on `/blog/`, in `/rss.xml` and (once it is not a draft) in the sitemap.

Optional `relatedFiles` is a list of founder-file slugs, such as `sam-altman`. They render as “Related files” at the foot of the post, using the same cards as the rest of the site. Leave the field out, or leave it empty, if there is no related file.

Sources are optional. If you add them, they are listed at the end of the page in the same numbered format as a Founder File.
