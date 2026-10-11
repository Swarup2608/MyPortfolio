import type {NextFunction, Request, Response} from "express";
import type {ZodType} from "zod";

export function validateBody(schema : ZodType){
    return (req: Request, res: Response, next: NextFunction):void => {
        const result = schema.safeParse(req.body);
        if(!result.success){
            res.status(400).json({
                success: false,
                message: "[validateBody] Validation failed",
                errors: result.error.flatten().fieldErrors,
            });
            return;
        }
        req.body = result.data;
        next();
    }
}

// Express 5 makes req.query read-only, so the parsed query is put on res.locals.query instead.
export function validateQuery(schema : ZodType){
    return (req: Request, res: Response, next: NextFunction):void => {
        const result = schema.safeParse(req.query);
        if(!result.success){
            res.status(400).json({
                success: false,
                message: "[validateQuery] Validation failed",
                errors: result.error.flatten().fieldErrors,
            });
            return;
        }
        res.locals.query = result.data;
        next();
    }
}
