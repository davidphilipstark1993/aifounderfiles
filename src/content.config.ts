import { defineCollection } from 'astro:content';
import { glob } from 'astro/loaders';
import { z } from 'astro/zod';

const files = defineCollection({
  loader: glob({ pattern: '**/*.{md,mdx}', base: './src/content/files' }),
  schema: ({ image }) =>
    z.object({
      title: z.string(),
      standfirst: z.string(),
      // Search-result overrides: a title of about 60 characters and a description of about 160. Both fall back to title/standfirst.
      seoTitle: z.string().optional(),
      metaDescription: z.string().optional(),
      fileNumber: z.number().int().positive(),
      publishDate: z.coerce.date(),
      updatedDate: z.coerce.date().optional(),
      author: z.string(),
      founder: z.object({
        name: z.string(),
        role: z.string(),
        linkedin: z.url().optional(),
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

export const collections = { files };
