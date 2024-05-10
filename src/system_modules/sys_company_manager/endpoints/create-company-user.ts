
import { Request, Response } from "express";
import Company from "../../../schemas/company/company_scema";
import { check_user_permission } from "../../../modules/app_manager";
import UserRole from "../../../schemas/company/user_permission_schema";
import reserved_roles from "../../../lib/reserved_roles";
import User from "../../../schemas/company/user_schema";
import { hash } from "bcrypt";

interface ComapanyUserBody {
    company_id: string,
    first_name: string,
    last_name: string,
    email: string,
    password: string,
    role_id: string,
}


/**
 * Endpoint api/v1/sys-company-manager/company/create-user
 * Protected Route
 * @param req  
 * @param res 
 */
export default async function create_new_company_user(req: Request, res: Response){
    const comp_user = req.body as ComapanyUserBody;
    const {user} = req.body as {user:any}; // authentication

    // permission validation
    // only super-admins
    if (!check_user_permission(user, "system-administration")) {
        res.status(403).json({
            "message": "No permissions"
        });
        return;
    }

    // find the company
    const company = await Company.findOne({_id:comp_user.company_id});
    if (!company){
        res.status(400).json({
            message: "Company does not exists."
        });
        return;
    }    

    // find the role
    const userRole = await UserRole.findById(comp_user.role_id);
    if (!userRole){
        res.status(400).json({
            message: "User role does not exists."
        });
        return;
    }

    if (userRole.slug in reserved_roles){
        res.status(403).json({
            message: "You are not authorized to create this account"
        });
        return;
    }

    // check weather user exists or not
    const user_check = await User.findOne({email:comp_user.email});
    if (user_check){
        res.status(400).json({
            message: "User already exists."
        });
        return;
    }

    // validate password
    if (!comp_user.password || comp_user.password.length < 6){
        res.status(400).json({
            message: "User already exists."
        });
        return;
    }
    const hashed_password = await hash(comp_user.password, 10);

    // validate input fields
    
    // save
    const newUser = new User({
        first_name: comp_user.first_name,
        last_name: comp_user.last_name,
        email: comp_user.email,
        password: hashed_password,
        role: userRole._id,
        company: company._id
    });
    newUser.save().then((doc)=>{
        res.status(200).json({
            _id:doc._id,
            first_name: doc.first_name,
            last_name: doc.last_name,
            email: doc.email,
            role: {
                _id:userRole._id,
                slug: userRole.slug,
            },
        })
    }).catch((error)=>{
        res.status(500).json({
            message: "internal server error",
            error: (process.env.DEBUG?error:"")
        });
    });
    
}