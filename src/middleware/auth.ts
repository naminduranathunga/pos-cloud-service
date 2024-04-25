/**
 * Allow only users with a valid token to access the protected routes
 */
import jwt from 'jsonwebtoken';

import { Request, Response, NextFunction } from 'express';

export function auth(req:Request, res:Response, next:NextFunction){
    // Get token from header
    const token = req.header('x-auth-token');

    // Check if not token
    if(!token){
        return res.status(401).json({msg: 'No token, authorization denied'});
    }

    try {
        const decoded = jwt.verify(token, process.env.JWT_SECRET);
        req.body.user = decoded;
        next();
    } catch (err) {
        res.status(401).json({msg: 'Token is not valid'});
    }
}