
import { Request, Response } from "express";
import Company from "../../../schemas/company/company_scema";
import { check_user_permission } from "../../../modules/app_manager";

interface ComapanyDetailsBody {
    name: string;
    brn: string;
    address: string;
    email: string;
    phone: string;
    subsribed_modules: string[];
    user: any
}


/**
 * Endpoint api/v1/sys-company-manager/company/create
 * Protected Route
 * @param req  
 * @param res 
 */
export default async function create_new_company(req: Request, res: Response){
    const company = req.body as ComapanyDetailsBody;
    /*const user = company.user;

    // permission validation
    // only super-admins
    if (!check_user_permission(user, "system-administration")) {
        res.status(403).json({
            "message": "No permissions"
        });
        return;
    }*/

    // check if company already exists
    const company_exists = await Company.findOne({email: company.email});
    if (company_exists) {
        res.status(400).json({
            message: "Company already exists"
        });
        return;
    }
    
    // create product category
    const new_company = new Company({
        name: company.name,
        brn: company.brn,
        email: company.email,
        address: company.address,
        modules: company.subsribed_modules,
        phone: company.phone
    });

    new_company.save().then((doc)=>{
        res.status(200).json(doc)
    }).catch((error)=>{
        res.status(500).json({
            message: "internal server error",
            error
        });
    });
}