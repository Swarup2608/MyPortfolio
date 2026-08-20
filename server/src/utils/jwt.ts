import jwt from "jsonwebtoken";
import {env} from "../config/env.js";
import type { UserRole } from "../models/User.model.js";

export interface JwtPayload{
    userId: string;
    role: UserRole;
}

export function createAccessToken(userId: string, role: UserRole) : string{
    return jwt.sign({userId, role},env.JWT_SECRET,{expiresIn: env.JWT_EXPIRES_IN as jwt.SignOptions['expiresIn']});
}

export function verifyAccessToken(token: string):JwtPayload{
    return jwt.verify(token,env.JWT_SECRET) as JwtPayload;
}