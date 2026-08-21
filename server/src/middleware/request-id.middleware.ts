import crypto from "node:crypto";
import type { NextFunction, Request, Response } from "express";

export function requestIdMiddleware(req: Request, res: Response, next: NextFunction): void {
    const requestId = req.header("X-Request-ID") ?? crypto.randomUUID();
    res.setHeader("X-Request-ID", requestId);
    next();
}
