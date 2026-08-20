import {z} from "zod";

export const createPostSchema = z.object({
    title: z.string().trim().min(3).max(200),
    slug: z.string().trim().min(3).max(200).regex(/^[a-z0-9]+(?:-[a-z0-9]+)*$/,"[Validation] Slug must contain only lowercase letter,numbers,and hypens"),
    excerpt: z.string().trim().min(1).max(500),
    content: z.string().min(1),
    coverImage: z.object({url: z.string().url(), key: z.string().min(1),alt: z.string().trim().max(200)}).optional(),
    tags: z.array(z.string().trim().min(1).max(50)),
    category: z.string().trim().max(100).optional(),
    status: z.enum([ "DRAFT", "PUBLISHED", "ARCHIVED"]).default("DRAFT"),
    seo: z.object({
        title: z.string().trim().max(200).optional(),
        description: z.string().trim().max(320).optional(),
        keywords: z.array(z.string().trim().max(100)).default([])
    }).default({title: "",description: "", keywords: []}),
});

export type CreatePostInput = z.infer<typeof createPostSchema>;
