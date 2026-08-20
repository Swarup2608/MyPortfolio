import type { Request, Response, NextFunction } from "express";

const SAFE_METHODS = new Set(["GET", "HEAD", "OPTIONS"]);

export function requireCsrf(req: Request, res: Response, next: NextFunction): void{
    if(SAFE_METHODS.has(req.method)){
        next();
        return;
    }
    const cookieToken = req.cookies?.csrf_token;

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
