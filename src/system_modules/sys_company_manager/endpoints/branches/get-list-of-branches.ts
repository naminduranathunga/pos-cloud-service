import { Request, Response } from "express";
import { check_user_permission } from "../../../../modules/app_manager";
import Branch from "../../../../schemas/company/branches_schema";

interface BranchListBody {
    companyId: string;
    perPage: number;
    page: number;
}

/**
 * Endpoint api/v1/sys-company-manager/branch/get
 * Protected Route
 * @param req  
 * @param res 
 */
export default async function get_branch_list(req: Request, res: Response) {
    const params = req.body as BranchListBody;
    const user = req.user;

    // Permission validation
    if (!check_user_permission(user, "system-administration")) {
        res.status(403).json({
            message: "No permissions"
        });
        return;
    }

    // Check if companyId is provided
    if (!params.companyId) {
        res.status(400).json({
            message: "companyId is required"
        });
        return;
    }

    const page = params.page || 1;
    const perPage = params.perPage || 20;
    const skip = (page - 1) * perPage;

    // Ensure companyId is included in the query
    const query = { company: params.companyId };

    try {
        const branches = await Branch.find(query).skip(skip).limit(perPage);
        res.status(200).json(branches);
    } catch (error) {
        res.status(500).json({
            message: "Error retrieving branches",
            error: error.message
        });
    }
}