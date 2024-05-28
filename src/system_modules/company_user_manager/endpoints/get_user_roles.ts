import mongoose from "mongoose";
import { check_user_permission } from "../../../modules/app_manager";
import UserRole from "../../../schemas/company/user_permission_schema";

interface get_user_roles_body {
    _id?: string,
    with_permissions?: boolean,
}
export default async function get_user_roles(req: any, res: any) {
    const user = req.user;
    const { company } = user;
    var { _id, with_permissions } = req.query as get_user_roles_body;;

    if (!company) {
        return res.status(400).json({ message: 'Company ID is required' });
    }

    // check if the user has the permission to get user roles
    if (!check_user_permission(user, 'get_user_roles') && !check_user_permission(user, 'company-admin') ) {
        return res.status(403).json({ message: 'No permissions' });
    };

    // get the user roles
    var args:any = {
        $or: [{ company: company }, { is_public: true }],
    };
    if (_id  && mongoose.Types.ObjectId.isValid(_id)) {
        args._id = _id;
    }

    var selection = ['_id', 'name', 'slug', 'description', 'is_public'];
    if (with_permissions) {
        selection.push('permissions');
        console.log(selection);
    }
    console.log("with_permissions", with_permissions);
    const roles = await UserRole.find(args).select(selection);
    return res.status(200).json(roles); 
}