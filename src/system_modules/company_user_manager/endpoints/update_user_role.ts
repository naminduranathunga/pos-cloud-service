import mongoose from "mongoose";
import { check_user_permission } from "../../../modules/app_manager";
import UserRole from "../../../schemas/company/user_permission_schema";


interface update_user_role_body {
    _id: string;
    role_name: string;
    description: string;
    is_public?: boolean;
    permissions: string[];
}

export default async function update_user_role(req: any, res: any) {
    const user = req.user;
    const { _id, role_name, permissions, description } = req.body as update_user_role_body;
    const { company } = user;

    if (!company) {
        return res.status(400).json({ message: 'Company ID is required' });
    }

    // check if the user has the permission to create a user role
    if (!check_user_permission(user, 'create_user_role') && !check_user_permission(user, 'company-admin') ) {
        return res.status(403).json({ message: 'No permissions' });
    };

    console.log('update_user_role', req.body);
    if (!_id) return res.status(400).json({ message: 'Role ID is required' });
    if (!mongoose.Types.ObjectId.isValid(_id)) return res.status(400).json({ message: 'Invalid Role ID' });
    
    const role = await UserRole.findOne({ _id, company });
    if (!role) return res.status(404).json({ message: 'Role not found' });

    let changed = false;
    if (role_name && role_name !== role.name) {
        role.name = role_name;
        changed = true;
    }

    if (permissions) {
        role.permissions = permissions;
        changed = true;
    }

    if (description && description !== role.description) {
        role.description = description;
        changed = true;
    }

    if (changed) {
        const saved_role = await role.save();
        return res.status(200).json(saved_role);
    }
    return res.status(200).json(role);
}