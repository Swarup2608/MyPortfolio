import { z } from "zod";

export const updateUserStatusSchema = z.object({
    isActive: z.boolean()
});

export type UpdateUserStatusInput = z.infer<typeof updateUserStatusSchema>;