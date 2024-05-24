import { NextFunction, Request, Response } from "express";


export default function errorHandler(err: any, req: Request, res: Response, next: NextFunction) {
    try {
        if (!err) return next();
    
        let error = {};
        if (process.env.DEBUG) {
            if (err instanceof Error) {
                error = {
                    message: err.message,
                    stack: err.stack
                }
                console.error(err);
            } else {
                error = err;
            }

            return res.status(500).json(error);
        }else{
            return res.status(500).json({message: 'Internal Server Error'});
        }
    } catch (error) {
        return res.status(500).json({message: 'Internal Server Error'});
    }
}