import type {Request, Response, NextFunction} from "express";

export function notFoundHandler(req: Request, res:Response, next:NextFunction):void{
    res.status(404).json({
        success: false,
        message: "[notFound] Route not found",
    })
}