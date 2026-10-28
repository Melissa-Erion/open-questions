import { defineCollection, z } from "astro:content";
import { glob } from "astro/loaders";

// One Markdown file per post in src/content/posts/
const posts = defineCollection({
  loader: glob({ pattern: "**/*.md", base: "./src/content/posts" }),
  schema: z.object({
    title: z.string(),
    subtitle: z.string().optional(),
    summary: z.string(),
    date: z.coerce.date(),
    updated: z.coerce.date().optional(),
    version: z.string().default("1.0"),
    // hypothesis | essay | note | draft
    kind: z.enum(["hypothesis", "essay", "note", "draft"]).default("essay"),
    status: z.string().optional(),
    tags: z.array(z.string()).default([]),
    // Numbered claims that contributors can respond to (P1, P2 …)
    claims: z
      .array(
        z.object({
          id: z.string(),
          title: z.string(),
          question: z.string(),
          prediction: z.string().optional(),
          falsification: z.string().optional(),
        })
      )
      .default([]),
    notClaimed: z.array(z.string()).default([]),
    disclaimer: z.string().optional(),
    draft: z.boolean().default(false),
  }),
});

export const collections = { posts };
