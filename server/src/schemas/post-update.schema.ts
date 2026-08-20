import { createPostSchema } from "./post.schema.js";
import {z} from 'zod';

export const updatePostSchema =
  createPostSchema.omit({status: true}).partial();

export type UpdatePostInput = z.infer<typeof updatePostSchema>;