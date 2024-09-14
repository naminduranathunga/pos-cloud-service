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
import Branch from './schemas/company/branches_schema';

export default async function UserLogin(req:Request, res:Response){
    const { email, password, populate, remember } = req.body;

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

    // expiresIn: 400h
    const token = jwt.sign(user_data, jwt_secret, { expiresIn: (remember === true) ? '1000h' : '400h' });
    let additional_time = (remember === true) ? 1000 : 400;
    const expiresIn = new Date(Date.now() + additional_time * 60 * 60 * 1000).getTime() / 1000;

    // populated user data
    let user_output:any = {...user_data};
    if (populate) {
        console.log('Populating user data');
        const populated:any = await (await user.populate('company')).populate('role');
        user_data.company = populated.company;
        if (populated.company){
            const branches = await Branch.find({company: populated.company._id});
            user_output.company_info = {
                _id: populated.company._id,
                name: populated.company.name,
                brn: populated.company.brn,
                address: populated.company.address,
                modules: populated.company.modules,
                isActive: populated.company.isActive,
                logo: populated.company.logo,
                branches: branches.map((branch:any) => {
                    return {
                        _id: branch._id,
                        name: branch.name
                    }
                })
            };
        }
        if (populated.role){
            user_output.role_info = {
                _id: populated.role._id,
                name: populated.role.name,
                slug: populated.role.slug,
                description: populated.role.description,
                permissions: populated.role.permissions
            };
        }
    }

    
    // Mock user
    res.json({
        "message": "Hello World! Auth",
        "token": token,
        "expiresIn": expiresIn,
        "user": user_output
    });
}