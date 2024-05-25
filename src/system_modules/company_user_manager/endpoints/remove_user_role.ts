import e from "express";
import reserved_roles from "../../../lib/reserved_roles";
import { check_user_permission } from "../../../modules/app_manager";
import UserRole from "../../../schemas/company/user_permission_schema";
import User from "../../../schemas/company/user_schema";

interface ComapanyUserBody {
    _id: string,
}

export default async function delete_company_user_role(req: any, res: any) {
    const user = req.user;
    const { _id } = req.body as ComapanyUserBody;
    const { company } = user;

    if (!company) {
        return res.status(400).json({ message: 'Company ID is required' });
    }

    // check if the user has the permission to create a user role
    if (!check_user_permission(user, 'delete_company_user') && !check_user_permission(user, 'company-admin') ) {
        return res.status(403).json({ message: 'No permissions' });
    };

    // get the role
    const role = await UserRole.findOne({_id: _id, company: company});
    if (!role){
        return res.status(400).json({ message: 'Role not found' });
    }

    // check if the role has assigned users
    const users = await User.find({role: role});
    if (users.length > 0){
        return res.status(400).json({ message: 'Role has assigned users. Remove the roles from users before delete.' });
    }

    // delete the role
    await role.deleteOne();

    return res.status(200).json({ message: 'User role was deleted' });

}