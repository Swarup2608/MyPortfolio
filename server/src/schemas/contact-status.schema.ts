import { z } from "zod";

export const contactStatusSchema = z.object({
    status: z.enum([
      "NEW",
      "READ",
      "ARCHIVED",
    ]),
});

export type ContactStatusInput = z.infer<typeof contactStatusSchema>;