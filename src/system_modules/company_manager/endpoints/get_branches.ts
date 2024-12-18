import { Request, Response } from "express";
import { check_user_permission } from "../../../modules/app_manager";
import Branch from "../../../schemas/company/branches_schema";
import mongoose from "mongoose";

interface request_body {
    company_id?: string;
    branch_id?: string;
}

export default async function get_branches(req: Request, res: Response){
    const user = req.user;
    const {branch_id} = req.query as unknown as request_body;

    // to get branch details, he must have permissions
    
    /*if ((!company_id || user.company !== company_id) && !check_user_permission(user, 'super-admin')){
        res.status(403).json({message:"Don't have permissions"})
    }*/
   if (!user.company){
        res.status(401).json({message:"User does not belong to any company"})
    }

    let args:any = {company:user.company};
    if (branch_id){
        if (mongoose.Types.ObjectId.isValid(branch_id)){
            const branch_id_ = mongoose.Types.ObjectId.createFromHexString(branch_id);
            args._id = branch_id_;
        } else {
            res.status(401).json({message:"Invalid branch id"})
        }
    }
    const branches = await Branch.find(args);
    res.status(200).json(branches);
}