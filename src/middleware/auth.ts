/**
 * Allow only users with a valid token to access the protected routes
 */
import jwt from 'jsonwebtoken';

import { Request, Response, NextFunction } from 'express';
//import { AuthenticatedUser } from '../interfaces/app_manager_interfaces';

export function auth(req:Request, res:Response, next:NextFunction){
    // Get token from header
    const token = req.header('x-auth-token');

    // Check if not token
    if(!token){
        console.log('No token, authorization denied');
        return res.status(401).json({msg: 'No token, authorization denied2'});
    }

    try {
        const decoded = jwt.verify(token, process.env.JWT_SECRET);
        //const auth_user = decoded as AuthenticatedUser;
        
        
        req.body.user = decoded;
        next();
    } catch (err) {
        res.status(401).json({msg: 'Token is not valid'});
    }
}