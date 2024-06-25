import { Request, Response } from "express";
import Branch from "../../../../schemas/company/branches_schema";
import { check_user_permission } from "../../../../modules/app_manager";

export default async function update_branch(req: Request, res: Response) {
    const user = req.user;
    const { _id, name, address, phone, email } = req.body;

    if (!user) {
        return res.status(401).json({ message: 'Unauthorized' });
    }

    // Check if the user has permission to update the branch details
    if (!check_user_permission(user, 'update_branch') && !check_user_permission(user, 'company-admin')) {
        return res.status(403).json({ message: 'No permissions' });
    }

    // Find the branch by ID
    const branch = await Branch.findById(_id);
    if (!branch) {
        return res.status(404).json({ message: 'Branch not found' });
    }

    let is_edited = false;

    if (name && name !== branch.name) {
        branch.name = name;
        is_edited = true;
    }

    if (address && address !== branch.address) {
        branch.address = address;
        is_edited = true;
    }

    let phoneArray: string[] = [];
    if (phone) {
        if (typeof phone === 'string') {
            phoneArray = phone.split(',').map(phone => phone.trim());
        } else if (Array.isArray(phone) && JSON.stringify(phone) !== JSON.stringify(branch.phone)) {
            phoneArray = phone;
        }
        if (JSON.stringify(phoneArray) !== JSON.stringify(branch.phone)) {
            branch.phone = phoneArray;
            is_edited = true;
        }
    }

    if (email && email !== branch.email) {
        branch.email = email;
        is_edited = true;
    }

    if (is_edited) {
        await branch.save();
        return res.status(200).json(branch);
    } else {
        return res.status(400).json({ message: 'No changes' });
    }
}