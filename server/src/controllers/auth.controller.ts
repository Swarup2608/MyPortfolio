import type {Request, Response} from "express";
import bcrypt from "bcryptjs";
import {User} from "../models/User.model.js";
import {createAccessToken} from "../utils/jwt.js";
import {env} from "../config/env.js";
import {Types} from "mongoose";
import type {AuthenticatedRequest} from "../middleware/auth.middleware.js";
import { createAuditLog } from "../services/audit.service.js";


// Login controller - Will verify if the user exists and if the password is correct, then generate a JWT token and send it back to the client via a cookie. The token will be used for authentication in subsequent requests.
export async function login(req: Request, res: Response) : Promise<void>{
    try{
        const {email, password} = req.body;
        const normalizedEmail = email.toLowerCase().trim();
        const user = await User.findOne({email: normalizedEmail}).select("+passwordHash");
        if(!user || !user.isActive){
            res.status(401).json({
                success: false,
                message: "[auth] Invalid email or password",
            });
            return;
        }
        const passwordMatches = await bcrypt.compare(password, user.passwordHash);
        if(!passwordMatches){
            res.status(401).json({
                success: false,
                message: "[auth] Invalid email or password",
            });
            return;
        }
        const token = createAccessToken(user._id.toString(), user.role);
        user.lastLoginAt = new Date();
        await user.save();
        await createAuditLog({
            req,
            userId: user._id.toString(),
            action: "LOGIN",
            resource: "USER",
            resourceId: user._id.toString(),
            description: `User "${user.name}" logged in`,
        });
        res.cookie("access_token", token, {
            httpOnly: true,
            secure: env.COOKIE_SECURE,
            sameSite : env.COOKIE_SAMESITE,
            maxAge: 8*60*60*1000,
            path: '/',
        });
        res.status(200).json({
            success: true,
            message: "[auth] Login successful",
            user: {
                id: user._id,
                name: user.name,
                email: user.email,
                role: user.role, 
            },
        });
    }
    catch(error){
        console.error("[auth] Login error:", error);
        res.status(500).json({
            success:false,
            message: "[auth] Unable to process login request",
        });
    }
}

// Logout controller - Will clear the JWT token cookie from the client, effectively logging the user out.
export async function logout(req: Request, res: Response): Promise<void>{
    res.clearCookie("access_token", {
        httpOnly: true,
        secure: env.COOKIE_SECURE,
        sameSite: env.COOKIE_SAMESITE,
        path: '/',
    });
    res.status(200).json({
        success: true,
        message: "[auth] Logout successful",
    });
}

// Get Me - Will return the currently authenticated user's information based on the JWT token provided in the cookie.
export async function getMe(req:AuthenticatedRequest, res: Response): Promise<void>{
    try{
        if(!req.user){
            res.status(401).json({
                success: false,
                message: "[auth] User not authenticated",
            });
            return;
        }
        if (!Types.ObjectId.isValid(req.user.userId)) {
            res.status(401).json({
                success: false,
                message: "Invalid user",
            });
            return;
        }
        const user = await User.findById(req.user.userId);
        if(!user || !user.isActive){
            res.status(401).json({
                success:false,
                message: "[auth] User not found or inactive",
            });
            return;
        }
        res.status(200).json({
            success: true,
            user:{
                id: user._id,
                name: user.name,
                email: user.email,
                role: user.role,
                isActive: user.isActive,
                lastLoginAt: user.lastLoginAt,
            },
        });
    }
    catch(error){
        console.error("[auth] Get Me error:", error);
        res.status(500).json({
            success: false,
            message: "[auth] Unable to retrieve user information",
        });
    }
}