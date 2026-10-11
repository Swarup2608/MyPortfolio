import type {NextFunction, Request, Response} from "express";
import mongoose from "mongoose";
import {User, type UserRole} from "../models/User.model.js";
import {verifyAccessToken, type JwtPayload} from "../utils/jwt.js";

export interface AuthenticatedRequest extends Request{
    user?: {
        userId: string;
        role: UserRole;
    };
}

export async function requireAuth(req: AuthenticatedRequest, res: Response, next: NextFunction): Promise<void>{
    const token = req.cookies?.access_token;
    if(!token){
        res.status(401).json({
            success: false,
            message: "[auth] Access token is missing",
        });
        return;
    }
    let payload: JwtPayload;
    try{
        payload = verifyAccessToken(token);
    }
    catch{
        res.status(401).json({
            success: false,
            message: "[auth] Invalid or expired authentication token",
        });
        return;
    }
    // Re-read the user so deactivation and role changes apply now, not when the token expires.
    const user = mongoose.isValidObjectId(payload.userId)
        ? await User.findById(payload.userId).select("role isActive").lean()
        : null;
    if(!user || !user.isActive){
        res.status(401).json({
            success: false,
            message: "[auth] User not found or inactive",
        });
        return;
    }
    req.user = {
        userId: payload.userId,
        role: user.role,
    };
    next();
}
