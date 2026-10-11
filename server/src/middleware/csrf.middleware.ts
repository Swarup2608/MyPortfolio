import type { Request, Response, NextFunction } from "express";
import { CSRF_COOKIE } from "../controllers/csrf.controller.js";

const SAFE_METHODS = new Set(["GET", "HEAD", "OPTIONS"]);

export function requireCsrf(req: Request, res: Response, next: NextFunction): void{
    if(SAFE_METHODS.has(req.method)){
        next();
        return;
    }
    const cookieToken = req.cookies?.[CSRF_COOKIE];

    const headerToken = req.header("X-CSRF-Token");
    if(!cookieToken || !headerToken || cookieToken !== headerToken){
        res.status(403).json({
            success: false,
            message: "[CSRF Token] Invalid CSRF Token"
        });
        return;
    }
    next();
}
