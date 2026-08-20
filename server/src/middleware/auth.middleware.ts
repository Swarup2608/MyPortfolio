import type {NextFunction, Request, Response} from "express";
import {verifyAccessToken} from "../utils/jwt.js";

export interface AuthenticatedRequest extends Request{
    user?: {
        userId: string;
        role: "ADMIN" | "EDITOR" | "VIEWER";
    };
}

export function requireAuth(req: AuthenticatedRequest, res: Response, next: NextFunction): void{
    try{
        const token = req.cookies?.access_token;
        if(!token){
            res.status(401).json({
                sucess: false,
                message: "[auth] Access token is missing",
            });
            return;
        }
        const payload = verifyAccessToken(token);
        req.user = {
            userId: payload.userId,
            role: payload.role,
        };
        next();
    }
    catch(error){
        res.status(401).json({
            sucess: false,
            message: "[auth] Invalid or expired authentication token",
        });
        return; 
    }
}