import type {Response} from "express";
import type {AuthenticatedRequest} from "../middleware/auth.middleware.js";

export function adminTest(req: AuthenticatedRequest, res: Response): void{
    res.status(200).json({
        success: true,
        message: "[rbac] Admin test successful",
    });
}

export function editorTest(req: AuthenticatedRequest, res: Response): void{
    res.status(200).json({
        success: true,
        message: "[rbac] Editor test successful",
    });
}

export function viewerTest(req: AuthenticatedRequest, res: Response): void{
    res.status(200).json({
        success: true,
        message: "[rbac] Viewer test successful",
    });
}