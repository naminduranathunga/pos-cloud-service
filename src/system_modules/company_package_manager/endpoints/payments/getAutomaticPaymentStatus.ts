
import { Request, Response } from 'express';
import { check_user_permission } from '../../../../modules/app_manager';
import Company from '../../../../schemas/company/company_scema';

export default async function company_get_automatic_payment_status (req: Request, res:Response){

    // auth & permission check
    const user = req.user;
    if (!user || !user.company) {
        return res.status(400).json({
            message: "User not found"
        });
    }
    if (!check_user_permission(user, "company-admin")){
        return res.status(403).json({
            "message": "No permissions"
        });
    }


    // get company 
    const company  = await Company.findOne({_id: user.company});
    if (!company) {
        return res.status(400).json({
            message: "Company not found"
        });
    }

    if (!company.company_data || !(company.company_data as any).automaticPayment){
       return res.json({
        automaticPayment : false
       })
    }

    return res.json({
        automaticPayment: (company.company_data as any).automaticPayment
    });
}