import { Request, Response } from 'express';
import Company from '../../../schemas/company/company_scema';


export default async function get_company_profile(req: Request, res: Response) {
    const user = req.user;

    const company_id = user.company;
    if (!company_id) {
        return res.status(400).json({
            message: 'User does not belong to any company',
        });
    }

    // view_company_profile
    
    const company = await Company.findById(company_id);
    if (!company) {
        return res.status(400).json({
            message: 'Company not found',
        });
    }

    return res.status(200).json(company);
}