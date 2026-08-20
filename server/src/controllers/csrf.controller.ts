import type { Request, Response } from "express";
import {env} from '../config/env.js';
import { generateCsrfToken } from "../utils/csrf.js";

export function getCsrfToken(_req: Request, res: Response) : void{
    const token = generateCsrfToken();
    res.cookie("csrf_token",token,{
        httpOnly: false,
        secure: env.COOKIE_SECURE,
        sameSite: env.COOKIE_SAMESITE,
        maxAge: 8 * 60 * 60 * 1000
    });
    res.status(200).json({success:true,csrfToken:token});
}