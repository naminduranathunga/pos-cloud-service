/**
 * This route handles the authentication and sends a jwt token
 * @param req 
 * @param res 
 */

import jwt from 'jsonwebtoken';
import {compare} from 'bcrypt';
import { Request, Response } from 'express';
import User from './schemas/company/user_schema';
import JwtTokenUser from './interfaces/jwt_token_user';

export default async function UserLogin(req:Request, res:Response){
    const { email, password } = req.body;

    // bad request
    if (!email || !password) {
        return res.status(400).json({ message: 'Email and password are required!' });
    }

    // Load user from database
    const user = await User.findOne({ email: email});
    if (!user) {
        return res.status(404).json({ message: 'Email or password is incorrect' });
    }

    // Check password
    const result = await compare(password, user.password);
    if (!result) {
        return res.status(404).json({ message: 'Email or password is incorrect' });
    }

    // creating the jwt token
    const jwt_secret = process.env.JWT_SECRET;
    if (!jwt_secret) {
        console.error('JWT_SECRET is not defined');
        return res.status(500).json({ message: 'Internal server error' });
    }

    const user_data: JwtTokenUser = {
        _id: user._id.toString(),
        first_name: user.first_name,
        last_name: user.last_name,
        email: user.email,
        role: user.role.toString(),
        company: user.company?.toString()
    };

    // expiresIn: 24h
    const token = jwt.sign(user_data, jwt_secret, { expiresIn: '400h'});
    
    // Mock user
    res.json({
        "message": "Hello World! Auth",
        "token": token,
        "user": user_data
    });
}