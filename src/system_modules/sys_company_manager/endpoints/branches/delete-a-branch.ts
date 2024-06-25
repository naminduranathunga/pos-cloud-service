import { Request, Response } from "express";
import Branch from "../../../../schemas/company/branches_schema";
import { check_user_permission } from "../../../../modules/app_manager";

/**
 * Endpoint api/v1/sys-company-manager/branch/delete
 * Protected Route
 * @param req  
 * @param res 
 */
export default async function delete_branch(req: Request, res: Response) {
    const { branchId } = req.body;
    const user = req.user;

    // permission validation
    // only super-admins
    if (!check_user_permission(user, "system-administration")) {
        res.status(403).json({
            message: "No permissions"
        });
        return;
    }

    // check if branch exists
    const branch_exists = await Branch.findById(branchId);
    if (!branch_exists) {
        res.status(400).json({
            message: "Branch does not exist"
        });
        return;
    }

    // delete branch
    Branch.findByIdAndDelete(branchId).then((doc) => {
        if (doc) {
            res.status(200).json({
                message: "Branch deleted successfully",
                branch: doc
            });
        } else {
            res.status(400).json({
                message: "Branch not found"
            });
        }
    }).catch((error) => {
        res.status(500).json({
            message: "Internal server error",
            error
        });
    });
}