import { coverImageSchema, createPostSchema } from "./post.schema.js";
import {z} from 'zod';

// Same reasoning as project-update.schema.ts: createPostSchema's `seo` field
// has a .default(...), which .partial() does not strip — an update that
// omits `seo` would otherwise silently wipe existing SEO metadata back to
// empty. Redefine it without a default so an omitted key stays omitted.
export const updatePostSchema =
  createPostSchema.omit({status: true, coverImage: true}).partial().extend({
    // null removes the existing cover image.
    coverImage: coverImageSchema.nullable().optional(),
  });

export type UpdatePostInput = z.infer<typeof updatePostSchema>;
