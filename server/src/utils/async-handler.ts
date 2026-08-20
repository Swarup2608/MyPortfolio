import type { NextFunction, Request, RequestHandler, Response } from "express";

export function asyncHandler<Req extends Request = Request>(handler: (req: Req, res: Response, next: NextFunction) => Promise<void>) : RequestHandler{
    return (req,res, next)=>{
        handler(req as Req,res, next).catch(next);
    };
}