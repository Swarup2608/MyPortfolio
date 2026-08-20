import {z} from "zod";
import { USER_ROLES } from "../models/User.model.js"

export const updateUserSchema = z.object({
    name: z.string().trim().min(2, "[validation] Name must have atleast 2 characters").max(100, "[validation] Name is too long").optional(),
    email : z.string().trim().email("[validation] Invalid email address").transform((value)=>value.toLowerCase()).optional(),
    role: z.enum(USER_ROLES).optional(),
});

export type UpdateUserInput = z.infer<typeof updateUserSchema>;