import { Request, Response } from "express";
import { check_user_permission, raise_event } from "../../../modules/app_manager";
import Branch from "../../../schemas/company/branches_schema";

interface request_body {
    name: string;
    address: string;
    phone?: string[];
    email?: string;
}


export default async function create_branch(req: Request, res: Response){
    const user = req.user;
    const {name, address, phone, email} = req.body as request_body;
    const { company } = user;

    if (!company) {
        return res.status(400).json({ message: 'Company ID is required' });
    }

    if (!check_user_permission(user, 'create_a_branch') && !check_user_permission(user, 'company-admin') ){
        return res.status(403).json({ message: 'No permissions' });
    }

    // host event - before and after create a branch 
    const new_branch = new Branch({
        company,
        name,
        address,
        phone,
        email
    });

    raise_event('company_manager/before_create_a_branch', {
        branch:new_branch,
        req,
        res
    });

    const saved = await new_branch.save();

    raise_event('company_manager/after_create_a_branch', {
        branch:saved,
        req,
        res
    });

    res.status(200).json(saved);
}