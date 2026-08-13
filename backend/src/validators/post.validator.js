import { z } from 'zod';

const objectId = z.string().regex(/^[a-f0-9]{24}$/i, 'Invalid id');

const postBody = z.object({
  title: z.string().trim().min(1).max(200),
  excerpt: z.string().trim().max(400).optional().default(''),
  content: z.string().trim().min(1),
  coverImage: z.string().trim().max(2000).optional().default(''),
  tags: z.array(z.string().trim().toLowerCase().max(40)).max(20).optional().default([]),
  status: z.enum(['draft', 'published']).optional().default('draft'),
  seoTitle: z.string().trim().max(200).optional().default(''),
  seoDescription: z.string().trim().max(300).optional().default(''),
});

export const createPostSchema = z.object({
  body: postBody,
  query: z.object({}).optional(),
  params: z.object({}).optional(),
});

export const updatePostSchema = z.object({
  body: postBody.partial(),
  query: z.object({}).optional(),
  params: z.object({ id: objectId }),
});

export const idParamSchema = z.object({
  body: z.object({}).optional(),
  query: z.object({}).optional(),
  params: z.object({ id: objectId }),
});

export const slugParamSchema = z.object({
  body: z.object({}).optional(),
  query: z.object({}).optional(),
  params: z.object({ slug: z.string().trim().min(1).max(250) }),
});

export const listQuerySchema = z.object({
  body: z.object({}).optional(),
  query: z.object({
    page: z.coerce.number().int().min(1).optional().default(1),
    limit: z.coerce.number().int().min(1).max(50).optional().default(10),
    tag: z.string().trim().toLowerCase().max(40).optional(),
  }),
  params: z.object({}).optional(),
});

// Admin dashboard/analytics pull larger batches to compute stats client-side.
export const adminListQuerySchema = z.object({
  body: z.object({}).optional(),
  query: z.object({
    page: z.coerce.number().int().min(1).optional().default(1),
    limit: z.coerce.number().int().min(1).max(500).optional().default(10),
    tag: z.string().trim().toLowerCase().max(40).optional(),
  }),
  params: z.object({}).optional(),
});
