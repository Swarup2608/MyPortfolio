import { z } from "zod";

export const updateUserPasswordSchema = z.object({
    password: z.string().min(8,"[validation] Password must have atleast 8 characters").max(128, "[validation] Password is too long"),
});

export type UpdateUserPasswordInput = z.infer<typeof updateUserPasswordSchema>;