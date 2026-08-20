import { z } from "zod";

export const projectStatusSchema = z.object({
    status: z.enum([
      "PUBLISHED",
      "DRAFT",
      "ARCHIVED",
    ]),
});

export type ProjectStatusInput = z.infer<typeof projectStatusSchema>;