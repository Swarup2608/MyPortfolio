import { z } from 'zod';

export const contactSchema = z.object({
  body: z.object({
    name: z.string().trim().min(1).max(120),
    email: z.string().trim().email().max(200),
    message: z.string().trim().min(1).max(5000),
    // Honeypot field: real users never fill this in; bots often do.
    website: z.string().max(0).optional().default(''),
  }),
  query: z.object({}).optional(),
  params: z.object({}).optional(),
});
