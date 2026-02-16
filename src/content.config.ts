import { defineCollection, z } from 'astro:content';

// Schema for WordPress posts
const posts = defineCollection({
  type: 'content',
  schema: z.object({
    title: z.string(),
    description: z.string().optional(),
    slug: z.string().optional(),
    pubDate: z.coerce.date(),
    updatedDate: z.coerce.date().optional(),
    author: z.string().optional(),
    featuredImage: z.string().optional(),
    featuredImageAlt: z.string().optional(),
    categories: z.array(z.string()).default([]),
    tags: z.array(z.string()).default([]),
    // WordPress-specific fields
    wpId: z.number().optional(), // Original WordPress ID
    wpSlug: z.string().optional(), // Original WordPress slug
    status: z.enum(['publish', 'draft', 'private']).default('publish'),
    // SEO fields (from Yoast or similar)
    seoTitle: z.string().optional(),
    seoDescription: z.string().optional(),
    canonicalUrl: z.string().optional(),
    noIndex: z.boolean().default(false),
  }),
});

// Schema for WordPress pages
const pages = defineCollection({
  type: 'content',
  schema: z.object({
    title: z.string(),
    description: z.string().optional(),
    slug: z.string().optional(),
    pubDate: z.coerce.date().optional(),
    updatedDate: z.coerce.date().optional(),
    date: z.coerce.date().optional(),
    modified: z.coerce.date().optional(),
    featuredImage: z.string().optional(),
    featuredImageAlt: z.string().optional(),
    ogImage: z.string().optional(),
    ogImageAlt: z.string().optional(),
    // WordPress-specific fields
    wpId: z.number().optional(),
    wpSlug: z.string().optional(),
    wpParentSlug: z.string().optional(), // For hierarchical pages
    template: z.string().optional(), // WordPress page template
    menuOrder: z.number().default(0),
    // SEO fields
    seoTitle: z.string().optional(),
    seoDescription: z.string().optional(),
    canonicalUrl: z.string().optional(),
    noIndex: z.boolean().default(false),
  }),
});

export const collections = { posts, pages };