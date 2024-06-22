import { Request, Response } from 'express';
import { check_user_permission } from '../../../../modules/app_manager';
import mongoose from 'mongoose';
import Branch from '../../../../schemas/company/branches_schema';

interface GRNBody {
    branch_id: string;
    date: number;
    items: {
        product_id: string;
        quantity: number;
        const_price: number;
        unit_price: number;
    }[];
    supplier_id: string;
    total: number;
    invoice_no: string;
    invoice_date: number;
    payment_mode?: string;
    payment_due_date?: number;
    payment_status?: string;
}

export default async function create_good_recive_note(req: Request, res: Response) {
    // authenticate user
    const user = req.user;
    //const { first_name, last_name, email, password, role_id } = req.body as ComapanyUserBody;
    const { company } = user;

    if (!company) {
        return res.status(401).json({message: 'User is not associated with any company'});
    }

    if (!check_user_permission(user, 'create_good_recive_note') && !check_user_permission(user, 'company-admin')) {
        return res.status(401).json({message: 'Unauthorized'});
    }




    // validate request body
    const grn = req.body as GRNBody;
    
    // validate branch_id
    if (!grn.branch_id || mongoose.Types.ObjectId.isValid(grn.branch_id) === false) {
        return res.status(400).json({message: 'Branch ID is required'});
    }
    const branch = await Branch.findOne({_id: grn.branch_id, company: company});
    if (!branch) {
        return res.status(400).json({message: 'Branch not found'});
    }

    // date required
    if (!grn.date) {
        return res.status(400).json({message: 'Date is required'});
    }

    res.status(200).json({message: 'Good Recive Note Created'});
}