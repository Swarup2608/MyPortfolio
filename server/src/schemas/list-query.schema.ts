import { z } from "zod";

const page = z.coerce.number().int().min(1).default(1);

export const publicPostListQuerySchema = z.object({
    page,
    limit: z.coerce.number().int().min(1).max(50).default(10),
    tag: z.string().trim().toLowerCase().max(50).optional(),
});

// The admin dashboard and analytics pull large batches to compute stats client-side.
export const adminListQuerySchema = z.object({
    page,
    limit: z.coerce.number().int().min(1).max(500).default(20),
});

export type PublicPostListQuery = z.infer<typeof publicPostListQuerySchema>;
export type AdminListQuery = z.infer<typeof adminListQuerySchema>;
