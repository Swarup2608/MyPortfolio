import type {NextFunction, Response} from "express";

import {hasPermission, type Permission} from "../config/permissions.js";
import type {AuthenticatedRequest} from "./auth.middleware.js";

export function requirePermission(permission: Permission){
    return (req: AuthenticatedRequest, res: Response, next: NextFunction): void => {
        if(!req.user){
            res.status(401).json({
                success: false,
                message: "[permission] User is not authenticated",
            });
            return; 
        }
        const allowed = hasPermission(req.user.role, permission);
        if(!allowed){
            res.status(403).json({
                success: false,
                message: "[permission] User does not have the required permission",
            });
            return; 
        }
        next();

    };
}