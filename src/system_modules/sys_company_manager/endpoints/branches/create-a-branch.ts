import { Request, Response } from "express";
import Branch from "../../../../schemas/company/branches_schema";
import Company from "../../../../schemas/company/company_scema";
import { check_user_permission } from "../../../../modules/app_manager";

interface BranchDetailsBody {
    company: string;
    name: string;
    address: string;
    phone?: string | string[];
    email?: string;
    user: any;
}

/**
 * Endpoint api/v1/sys-company-manager/branch/create
 * Protected Route
 * @param req  
 * @param res 
 */
export default async function create_new_branch(req: Request, res: Response) {
    const branch = req.body as BranchDetailsBody;
    const user = req.user;

    // permission validation
    // only super-admins
    if (!check_user_permission(user, "system-administration")) {
        res.status(403).json({
            message: "No permissions"
        });
        return;
    }

    // check if company exists
    const company_exists = await Company.findById(branch.company);
    if (!company_exists) {
        res.status(400).json({
            message: "Company does not exist"
        });
        return;
    }

    // check if branch already exists
    const branch_exists = await Branch.findOne({
        company: branch.company,
        name: branch.name
    });
    if (branch_exists) {
        res.status(400).json({
            message: "Branch already exists"
        });
        return;
    }

    // Handle phone numbers
    let phoneArray: string[] = [];
    if (branch.phone) {
        if (typeof branch.phone === 'string') {
            phoneArray = branch.phone.split(',').map(phone => phone.trim());
        } else if (Array.isArray(branch.phone)) {
            phoneArray = branch.phone;
        }
    }

    // create new branch
    const new_branch = new Branch({
        company: branch.company,
        name: branch.name,
        address: branch.address || "",
        phone: phoneArray,
        email: branch.email || ""
    });

    new_branch.save().then((doc) => {
        res.status(200).json(doc);
    }).catch((error) => {
        res.status(500).json({
            message: "Internal server error",
            error
        });
    });
}