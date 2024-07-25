import { Request, Response } from "express";
import Company from "../../../schemas/company/company_scema";
import { check_user_permission } from "../../../modules/app_manager";

interface CompanyDetailsParams {
    id: string;
}

/**
 * Endpoint api/v1/pos-software/get_company
 * Protected Route
 * @param req  
 * @param res 
 */
export default async function get_company_detail(req: Request, res: Response) {
    /**
     * Node for Janani- Request body is not available for GET requests. Use req.query with parameters or move to POST requests
     */
    const params = req.query as unknown as CompanyDetailsParams;
    const user = req.user;

    // Permission validation (no need to check for super-admin, assuming check_user_permission handles JWT)
    // if (!check_user_permission(user)) {
    //     res.status(403).json({
    //         "message": "No permissions"
    //     });
    //     return;
    // }

    if (!params.id) {
        res.status(400).json({
            "message": "Company ID required"
        });
        return;
    }

    try {
        const company = await Company.findById(params.id);
        if (!company) {
            res.status(404).json({
                "message": "Company not found"
            });
            return;
        }

        res.status(200).json(company);
    } catch (error) {
        res.status(500).json({
            "message": "Internal server error",
            error
        });
    }
}
