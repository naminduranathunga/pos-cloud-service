/**
 * This route handles the authentication and sends a jwt token
 * @param req 
 * @param res 
 */

import jwt from 'jsonwebtoken';
import { Request, Response } from 'express';

export default function UserLogin(req:Request, res:Response){
    // Mock user
    res.json({
        "message": "Hello World! Auth",
    });
}