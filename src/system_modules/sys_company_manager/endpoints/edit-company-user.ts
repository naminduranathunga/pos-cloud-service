import e from "express";
import reserved_roles from "../../../lib/reserved_roles";
import { check_user_permission } from "../../../modules/app_manager";
import UserRole from "../../../schemas/company/user_permission_schema";
import User from "../../../schemas/company/user_schema";
import { hash } from "bcrypt";

interface CompanyUserBody {
    _id: string,
    first_name?: string,
    last_name?: string,
    email?: string,
    password?: string,
    role_id?: string,
}

export default async function edit_company_user(req: e.Request, res: e.Response) {
    try {
        const user = req.user;
        const { _id, first_name, last_name, email, password, role_id } = req.body as CompanyUserBody;

        // Check if the user has the permission to edit a user role
        if (!check_user_permission(user, 'edit_user_role') && !check_user_permission(user, 'company-admin')) {
            return res.status(403).json({ message: 'No permissions' });
        };

        // Get the user
        const editing_user = await User.findById(_id);
        if (!editing_user) {
            return res.status(400).json({ message: 'User not found' });
        }

        let is_edited = false;
        if (first_name && first_name !== editing_user.first_name) {
            editing_user.first_name = first_name;
            is_edited = true;
        }
        if (last_name && last_name !== editing_user.last_name) {
            editing_user.last_name = last_name;
            is_edited = true;
        }

        if (email && email !== editing_user.email) {
            editing_user.email = email;
            is_edited = true;
        }

        if (password) {
            if (password.length < 6) {
                return res.status(400).json({ message: 'Password must be at least 6 characters long' });
            }

            const hashed_password = await hash(password, 10);
            editing_user.password = hashed_password;
            is_edited = true;
        }

        if (role_id && role_id !== editing_user.role.toString()) {
            const userRole = await UserRole.findById(role_id);
            if (!userRole) {
                return res.status(400).json({ message: 'Role not found' });
            }
            editing_user.role = userRole._id;
            is_edited = true;
        }

        if (is_edited) {
            await editing_user.save();
            return res.status(200).json(editing_user);
        } else {
            return res.status(400).json({ message: 'No changes' });
        }
    } catch (error) {
        console.error('Error editing user:', error);
        return res.status(500).json({ message: 'Internal server error' });
    }
}