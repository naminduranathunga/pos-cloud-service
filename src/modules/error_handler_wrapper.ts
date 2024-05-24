import { NextFunction, Request, Response } from "express";

/***
 * This function is a wrapper for the error handler. This will catch any error thrown by the function and pass it to the error handler.
 * @param func
 * @returns Function
 */

export function error_handler_wrapper(func: (req: Request, res:Response, next: NextFunction) => void){
    return async (req: Request, res: Response, next: NextFunction) => {
        try {
            await func(req, res, next);
        } catch (error) {
            next(error);
        }
    }
}