import jwt from "jsonwebtoken";
import {env} from "../config/env.js";
import type { UserRole } from "../models/User.model.js";
import { jwtPayloadSchema, type JwtPayload } from "../schemas/jwt.schema.js";

export type { JwtPayload };

export function createAccessToken(userId: string, role: UserRole) : string{
    return jwt.sign({userId, role},env.JWT_SECRET,{expiresIn: env.JWT_EXPIRES_IN as jwt.SignOptions['expiresIn']});
}

export function verifyAccessToken(token: string): JwtPayload{
    const decoded = jwt.verify(token, env.JWT_SECRET);
    const result = jwtPayloadSchema.safeParse(decoded);
    if(!result.success){
        throw new Error("Invalid JWT payload");
    }
    return result.data;
}
