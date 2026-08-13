import { z } from 'zod';

export const loginSchema = z.object({
  body: z.object({
    email: z.string().trim().email().max(200),
    password: z.string().min(1).max(200),
  }),
  query: z.object({}).optional(),
  params: z.object({}).optional(),
});
