import { Request, Response } from "express";
import { check_user_permission } from "../../../modules/app_manager";
import User from "../../../schemas/company/user_schema";

interface UserDetailsBody {
    companyId: string;
    perPage: number;
    page: number;
}

/**
 * Endpoint api/v1/sys-company-manager/user/get
 * Protected Route
 * @param req  
 * @param res 
 */
export default async function get_user_list(req: Request, res: Response) {
    const params = req.body as UserDetailsBody;
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
        const users = await User.find(query).skip(skip).limit(perPage).populate('role').populate('company');
        res.status(200).json(users);
    } catch (error) {
        res.status(500).json({
            message: "Error retrieving users",
            error: error.message
        });
    }
}