import { defineCollection } from 'astro:content';
import { glob } from 'astro/loaders';
import { z } from 'astro/zod';

const files = defineCollection({
  loader: glob({ pattern: '**/*.{md,mdx}', base: './src/content/files' }),
  schema: ({ image }) =>
    z.object({
      title: z.string(),
      // The H1 on the website: the founder's name and "AI", e.g. "How Maarten used AI to rebuild his business".
      // `title` stays the issue title used in the PDF, email, cards and share image. Falls back to title.
      headline: z.string().optional(),
      standfirst: z.string(),
      // Search-result overrides: a title of about 60 characters and a description of about 160. Both fall back to title/standfirst.
      seoTitle: z.string().optional(),
      metaDescription: z.string().optional(),
      // One line on how the founder uses AI, shown on /founders/. Only what the file itself says.
      aiUseCase: z.string().optional(),
      // 'behind-the-tools' marks profiles of the people who make the AI tools founders use (OpenAI, Anthropic).
      // They are listed separately on /founders/ and the home page.
      coverage: z.enum(['built-with-ai', 'behind-the-tools']).default('built-with-ai'),
      fileNumber: z.number().int().positive(),
      publishDate: z.coerce.date(),
      updatedDate: z.coerce.date().optional(),
      author: z.string(),
      founder: z.object({
        name: z.string(),
        role: z.string(),
        linkedin: z.url().optional(),
        // When a file covers more than one founder, list each person for structured data (Person markup).
        people: z.array(z.object({ name: z.string(), jobTitle: z.string() })).optional(),
      }),
      company: z.object({
        name: z.string(),
        website: z.url().optional(),
        // Any of these can be omitted (shown as "Undisclosed") or written as "Undisclosed".
        founded: z.coerce.string().optional(),
        hq: z.string().optional(),
        sector: z.string(),
        stage: z.string().optional(),
        funding: z.string().optional(),
        businessModel: z.string().optional(),
      }),
      pillar: z.enum(['founder-files', 'company-files', 'how-they-built-it', 'business-models']).default('founder-files'),
      tags: z.array(z.string()),
      heroImage: z.object({ src: image(), alt: z.string() }).optional(),
      sources: z.array(z.object({ title: z.string(), url: z.url() })),
      draft: z.boolean().default(false),
    }),
});

const blog = defineCollection({
  loader: glob({ pattern: '**/*.{md,mdx}', base: './src/content/blog' }),
  schema: z.object({
    title: z.string(),
    description: z.string(),
    // Search-result title override of about 60 characters. Falls back to title.
    seoTitle: z.string().optional(),
    // Meta description override of about 160 characters. Falls back to description (the standfirst).
    seoDescription: z.string().optional(),
    publishDate: z.coerce.date(),
    updatedDate: z.coerce.date().optional(),
    author: z.string(),
    tags: z.array(z.string()).default([]),
    sources: z.array(z.object({ title: z.string(), url: z.url() })).default([]),
    relatedFiles: z.array(z.string()).optional(),
    draft: z.boolean().default(false),
  }),
});

export const collections = { files, blog };
