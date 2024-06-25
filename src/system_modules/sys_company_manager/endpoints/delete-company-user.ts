import { Request, Response } from "express";
import Company from "../../../schemas/company/company_scema";
import { check_user_permission } from "../../../modules/app_manager";
import User from "../../../schemas/company/user_schema";

/**
 * Endpoint api/v1/sys-company-manager/company/delete-user
 * Protected Route
 * @param req  
 * @param res 
 */
export default async function delete_company_user(req: Request, res: Response){
    const { company_id, user_id } = req.body;
    const user = req.user;

    // permission validation
    // only super-admins
    if (!check_user_permission(user, "system-administration")) {
        res.status(403).json({
            "message": "No permissions"
        });
        return;
    }

    // find the company
    const company = await Company.findOne({_id: company_id});
    if (!company){
        res.status(400).json({
            message: "Company does not exist."
        });
        return;
    }    

    // find the user
    const user_to_delete = await User.findOne({_id: user_id, company: company._id});
    if (!user_to_delete){
        res.status(400).json({
            message: "User does not exist in the specified company."
        });
        return;
    }

    // delete user
    await User.deleteOne({ _id: user_to_delete._id }).then(() => {
        res.status(200).json({
            message: "User deleted successfully."
        });
    }).catch((error) => {
        res.status(500).json({
            message: "Internal server error",
            error: (process.env.DEBUG ? error : "")
        });
    });
}