import { defineCollection } from 'astro:content';
import { z } from 'astro/zod';
import { glob } from 'astro/loaders';
import { projectRuleErrors } from './lib/project-rules.ts';

// One Markdown file per project in src/content/projects/. The filename is the URL:
// src/content/projects/toril.md → /projects/toril. Only public kovirlabs repos belong here.
// `support` is set by the kovir.org team (see CLAUDE.md).
const projects = defineCollection({
  loader: glob({ pattern: '*.md', base: './src/content/projects' }),
  schema: ({ image }) =>
    z
      .object({
        name: z.string(),
        repo: z.string().regex(/^kovirlabs\/[\w.-]+$/, 'repo must be kovirlabs/<name>'),
        tagline: z.string().max(110),
        audience: z.string(),
        support: z.enum(['official', 'incubating', 'lab']),
        status: z.enum(['stable', 'beta', 'pre-release', 'archived']),
        supportedSince: z.coerce.date().optional(),
        featured: z.boolean().default(false),
        order: z.number().default(100),
        category: z.enum(['desktop-app', 'library', 'education', 'tooling']),
        platforms: z.array(z.enum(['windows', 'macos', 'linux', 'web', 'python'])).min(1),
        website: z.url().optional(),
        docs: z.url().optional(),
        forkOf: z.string().optional(),
        ideas: z.array(z.number().int().positive()).default([]),
        icon: image().optional(),
        screenshots: z.array(z.object({ src: image(), alt: z.string().min(1) })).default([]),
        // Drafts render in `npm run dev` only.
        draft: z.boolean().default(false),
      })
      .superRefine((data, ctx) => {
        for (const message of projectRuleErrors(data)) ctx.addIssue({ code: 'custom', message });
      }),
});

export const collections = { projects };
