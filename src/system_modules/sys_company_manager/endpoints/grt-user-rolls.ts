import { Request, Response } from "express";
import UserRole from "../../../schemas/company/user_permission_schema";
import { check_user_permission } from "../../../modules/app_manager";

interface UserRoleDetailsBody {
    name?: string;
    perPage: number;
    page: number;
}

/**
 * Endpoint api/v1/sys-company-manager/user-role/get
 * Protected Route
 * @param req  
 * @param res 
 */
export default async function get_user_role_list(req: Request, res: Response) {
    const params = req.body as UserRoleDetailsBody;
    const user = req.user;

    // permission validation
    // only super-admins
    if (!check_user_permission(user, "system-administration")) {
        res.status(403).json({
            message: "No permissions"
        });
        return;
    }

    const page = params.page || 1;
    const perPage = params.perPage || 20;
    const skip = (page - 1) * perPage;

    let query = {};
    if (params.name) {
        query = {
            name: {
                $regex: params.name,
                $options: 'i'
            }
        };
    }

    const userRoles = await UserRole.find(query).skip(skip).limit(perPage);

    res.status(200).json(userRoles);
}