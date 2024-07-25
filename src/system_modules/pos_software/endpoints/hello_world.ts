import { Request, Response } from "express";

/**
 * Endpoint api/v1/hello
 * @param req  
 * @param res 
 */
export default function hello(req: Request, res: Response) {
    res.status(200).json({ message: "Hello World" });
}