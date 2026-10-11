import { z } from "zod";
import { USER_ROLES } from "../models/User.model.js";

export const jwtPayloadSchema = z.object({
    userId: z.string().min(1),
    role: z.enum(USER_ROLES),
});

export type JwtPayload = z.infer<typeof jwtPayloadSchema>;
