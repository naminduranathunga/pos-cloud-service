import { Request, Response } from 'express';
import { check_user_permission } from '../../../../modules/app_manager';
import { ConnectMySQLCompanyDb } from '../../../../lib/connect_sql_server';
import Company from '../../../../schemas/company/company_scema';


export default async function remove_vendor(req: Request, res: Response) {
    
    const user = req.user;
    if (!user || !user.company){
        return res.status(401).json({message: 'User is not associated with any company'});
    }
    if (!check_user_permission(user, 'manage_inventory') && !check_user_permission(user, 'company-admin')) {
        return res.status(401).json({message: 'Unauthorized'});
    }

    //validate request

    // establish DB connection
    const company = await Company.findOne({_id: user.company});
    if (!company) {
        return res.status(400).json({message: 'Company not found'});
    }

    const conn = await ConnectMySQLCompanyDb(company);
    
    return res.status(200).json({});
}