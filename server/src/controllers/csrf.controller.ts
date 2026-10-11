import type { Request, Response } from "express";
import {env} from '../config/env.js';
import { generateCsrfToken } from "../utils/csrf.js";

export const CSRF_COOKIE = "csrf_token";

export function getCsrfToken(_req: Request, res: Response) : void{
    const token = generateCsrfToken();
    res.cookie(CSRF_COOKIE,token,{
        httpOnly: false,
        secure: env.COOKIE_SECURE,
        sameSite: env.COOKIE_SAMESITE,
        maxAge: 8 * 60 * 60 * 1000,
        // Without an explicit path the cookie would be scoped to /api/csrf and never reach the admin routes.
        path: "/",
    });
    res.status(200).json({success:true,csrfToken:token});
}
