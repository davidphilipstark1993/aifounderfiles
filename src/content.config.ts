import { defineCollection, reference } from 'astro:content';
import { glob } from 'astro/loaders';
import { z } from 'astro/zod';

/**
 * Bylines. One file per author in src/content/authors/; the filename is the slug (/authors/<slug>/).
 * A file's `author` field is that slug.
 */
const authors = defineCollection({
  loader: glob({ pattern: '**/*.{md,mdx}', base: './src/content/authors' }),
  schema: ({ image }) =>
    z.object({
      name: z.string(),
      /** Use 'organization' for a house byline. It changes the schema.org type from Person to Organization. */
      type: z.enum(['person', 'organization']).default('person'),
      jobTitle: z.string().optional(),
      bio: z.string().optional(),
      photo: z.object({ src: image(), alt: z.string() }).optional(),
      sameAs: z
        .object({
          linkedin: z.url().optional(),
          x: z.url().optional(),
        })
        .default({}),
    }),
});

const files = defineCollection({
  loader: glob({ pattern: '**/*.{md,mdx}', base: './src/content/files' }),
  schema: ({ image }) =>
    z.object({
      title: z.string(),
      standfirst: z.string(),
      /** Meta description (also Open Graph and JSON-LD). About 155 characters; falls back to the standfirst. */
      description: z.string().max(160).optional(),
      fileNumber: z.number().int().positive(),
      publishDate: z.coerce.date(),
      updatedDate: z.coerce.date().optional(),
      author: reference('authors'),
      founder: z.object({
        name: z.string(),
        role: z.string(),
        linkedin: z.url().optional(),
        /** Wikipedia or other profile pages for the founder, used as schema.org sameAs. */
        sameAs: z.array(z.url()).optional(),
        /** For a file about more than one founder: one entry per person, so each becomes its own Person in the JSON-LD. */
        members: z
          .array(z.object({ name: z.string(), jobTitle: z.string().optional(), sameAs: z.array(z.url()).optional() }))
          .optional(),
      }),
      company: z.object({
        name: z.string(),
        website: z.url().optional(),
        /** Wikipedia or other profile pages for the company, used as schema.org sameAs (the website is added automatically). */
        sameAs: z.array(z.url()).optional(),
        // Any of these can be omitted (shown as "Undisclosed") or written as "Undisclosed".
        founded: z.coerce.string().optional(),
        hq: z.string().optional(),
        sector: z.string(),
        stage: z.string().optional(),
        funding: z.string().optional(),
        businessModel: z.string().optional(),
      }),
      tags: z.array(z.string()),
      heroImage: z.object({ src: image(), alt: z.string() }).optional(),
      /** Optional "Quick answers" section, rendered before Sources and published as FAQPage JSON-LD. Answers may use [^n] citation markers. */
      faq: z.array(z.object({ question: z.string(), answer: z.string() })).optional(),
      sources: z.array(z.object({ title: z.string(), url: z.url() })),
      draft: z.boolean().default(false),
    })
    .refine((d) => !d.updatedDate || d.updatedDate >= d.publishDate, {
      message: 'updatedDate is earlier than publishDate',
      path: ['updatedDate'],
    }),
});

export const collections = { files, authors };
