import { check_user_permission, get_registered_permissions } from "../../../modules/app_manager";


export default async function get_user_permission_list(req: any, res: any) {
    const user = req.user;
    const { company } = user;

    if (!company) {
        return res.status(400).json({ message: 'Company ID is required' });
    }

    // check if the user has the permission to create a user role
    if (!check_user_permission(user, 'create_user_role') && !check_user_permission(user, 'company-admin') ) {
        return res.status(403).json({ message: 'No permissions' });
    };

    // get the user permissions
    var permissions = get_registered_permissions();
    permissions = permissions.filter((permission) => permission.module !== 'Sys Company Manager' );
    const list_p = permissions.map((permission) => {
        return {
            name: permission.name,
            label: permission.label,
            module: permission.module,
        }
    });
    return res.status(200).json(list_p);
}