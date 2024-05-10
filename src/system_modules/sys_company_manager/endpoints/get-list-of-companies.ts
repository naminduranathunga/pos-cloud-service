


import { Request, Response } from "express";
import Company from "../../../schemas/company/company_scema";
import { check_user_permission } from "../../../modules/app_manager";

interface ComapanyDetailsBody {
    name?: string,
    perPage: number,
    page: number,
}


/**
 * Endpoint api/v1/sys-company-manager/company/get
 * Protected Route
 * @param req  
 * @param res 
 */
export default async function get_company_list(req: Request, res: Response){
    const params = req.body as ComapanyDetailsBody;
    /*const {user} = req.body as {user:any}; // authentication

    // permission validation
    // only super-admins
    if (!check_user_permission(user, "system-administration")) {
        res.status(403).json({
            "message": "No permissions"
        });
        return;
    }*/

    const page = params.page || 1;
    const perPage = params.perPage || 20;
    const skip = (page - 1) * perPage;

    var query = {};
    if (params.name){
        query = {
            name: {
                $regex: params.name,
                $options: 'i'
            }
        }
    }
    
    // 
    const companies = await Company.find(query).skip(skip).limit(perPage);

    res.status(200).json(companies);
}