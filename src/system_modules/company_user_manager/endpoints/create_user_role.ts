import { check_user_permission } from "../../../modules/app_manager";
import UserRole from "../../../schemas/company/user_permission_schema";


const create_user_role_body = {
    role_name: 'string',
    permissions: ['string'],
}

export default async function create_user_role(req: any, res: any) {
    const user = req.user;
    const { role_name, permissions, is_public } = req.body as { role_name: string, permissions: Array<string>, is_public?: boolean};
    const { company } = user;

    if (!company) {
        return res.status(400).json({ message: 'Company ID is required' });
    }

    // check if the user has the permission to create a user role
    if (!check_user_permission(user, 'create_user_role') && !check_user_permission(user, 'company-admin') ) {
        return res.status(403).json({ message: 'No permissions' });
    };

    // validate request
    if (!role_name) return res.status(400).json({ message: 'Role name is required' });
    if (!permissions) return res.status(400).json({ message: 'Permissions are required' });

    // create the user role
    var slug = role_name.toLowerCase().replace(' ', '_');
    // check if the role already exists
    const roles = await UserRole.find({ company: company, slug });
    if (roles.length > 0) {
        return res.status(400).json({ message: 'Role already exists' });
    }

    var user_role = new UserRole({
        name:role_name,
        slug,
        permissions,
        company
    });

    const saved_role = await user_role.save();
    return res.status(200).json(saved_role);
}