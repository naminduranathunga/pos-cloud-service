import { Request, Response } from 'express';
import get_next_grn_no from '../../functions/grn_functions';
import Branch from '../../../../schemas/company/branches_schema';
import mongoose from 'mongoose';


export default async function get_next_grn_number(req: Request, res: Response) {
    const user = req.user;
    //const { first_name, last_name, email, password, role_id } = req.body as ComapanyUserBody;
    const { company } = user;
    if (!user.company) return res.status(400).json({message: "User does not belong to a company"});

    const {branch_id } = req.query as { branch_id: string };
    if (!branch_id){
        return res.status(400).json({message: "branch_id is required."});
    }
    if (!mongoose.Types.ObjectId.isValid(branch_id)){
        return res.status(400).json({message: "branch_id is invalid. 1"});
    }

    const branch = await Branch.findOne({
        company: user.company,
        _id: mongoose.Types.ObjectId.createFromHexString(branch_id)
    });
    if (!branch){
        return res.status(400).json({message: "branch_id is invalid."});
    }
    
    const n = await get_next_grn_no(branch);

    return res.json({grn_number:n});
}