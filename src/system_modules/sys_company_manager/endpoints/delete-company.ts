import { Request, Response } from "express";
import Company from "../../../schemas/company/company_scema";
import { check_user_permission } from "../../../modules/app_manager";

export default async function delete_company(req: Request, res: Response) {
    const user = req.user;
    const { _id } = req.body;

    if (!user) {
        return res.status(401).json({ message: 'Unauthorized' });
    }

    // Check if the user has permission to delete the company
    if (!check_user_permission(user, 'delete_company') && !check_user_permission(user, 'company-admin')) {
        return res.status(403).json({ message: 'No permissions' });
    }

    // Find and delete the company by ID
    const company = await Company.findByIdAndDelete(_id);
    if (!company) {
        return res.status(404).json({ message: 'Company not found' });
    }

    return res.status(200).json({ message: 'Company deleted successfully' });
}