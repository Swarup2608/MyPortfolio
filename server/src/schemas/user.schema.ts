import {z} from 'zod';
import { USER_ROLES } from '../models/User.model.js';

export const createUserSchema = z.object({
    name: z.string().trim().min(2, "[validation] Name must have atleast 2 characters").max(100, "[validation] Name is too long"),
    email : z.string().trim().email("[validation] Invalid email address").transform((value)=>value.toLowerCase()),
    password: z.string().min(8,"[validation] Password must have atleast 8 characters").max(128, "[validation] Password is too long"),
    role: z.enum(USER_ROLES)
});

export type CreateUserInput = z.infer<typeof createUserSchema>;