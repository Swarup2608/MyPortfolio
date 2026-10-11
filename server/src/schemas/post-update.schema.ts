import { coverImageSchema, createPostSchema } from "./post.schema.js";
import {z} from 'zod';

export const updatePostSchema =
  createPostSchema.omit({status: true, coverImage: true}).partial().extend({
    // null removes the existing cover image.
    coverImage: coverImageSchema.nullable().optional(),
  });

export type UpdatePostInput = z.infer<typeof updatePostSchema>;
