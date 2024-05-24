import { check_user_permission } from "../../../modules/app_manager";


export default function create_user_role(req: any, res: any) {
    const user = req.user;
    const { role_name, permissions, is_public } = req.body as { role_name: string, permissions: Array<string>, is_public?: boolean};
    const { company_id } = user;

    if (!company_id) {
        return res.status(400).json({ message: 'Company ID is required' });
    }

    // check if the user has the permission to create a user role
    if (!check_user_permission(user, 'create_user_role') && !check_user_permission(user, 'company-admin') ) {
        return res.status(403).json({ message: 'No permissions' });
    };

    // validate request
    if (!role_name) return res.status(400).json({ message: 'Role name is required' });
    if (!permissions) return res.status(400).json({ message: 'Permissions are required' });

    

}