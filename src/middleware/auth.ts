/**
 * Allow only users with a valid token to access the protected routes
 */
import jwt from 'jsonwebtoken';

import { Request, Response, NextFunction } from 'express';
import JwtTokenUser from '../interfaces/jwt_token_user';
import UserRole from '../schemas/company/user_permission_schema';
//import { AuthenticatedUser } from '../interfaces/app_manager_interfaces';

export async function auth(req:Request, res:Response, next:NextFunction){
    // Get token from header Authorization: Bearer <token>
    var token = '';
    try {
        token = req.header('Authorization')?.split(' ')[1];
    } catch (error) {
        res.status(401).json({msg: 'No token, authorization denied'});
        return;        
    }

    // Check if not token
    if(!token){
        console.log('No token, authorization denied');
        return res.status(401).json({msg: 'No token, authorization denied2'});
    }

    try {
        const decoded = jwt.verify(token, process.env.JWT_SECRET) as JwtTokenUser;
        // get user role from token
        decoded.role = await UserRole.findById(decoded.role);        
        if (!decoded.role) {
            res.status(401).json({msg: 'Token is not valid'});
            return;
        }
        req.body.user = decoded;
        next();
    } catch (err) {
        res.status(401).json({msg: 'Token is not valid'});
    }
}