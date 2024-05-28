import mongoose from "mongoose";
import { check_user_permission } from "../../../modules/app_manager";
import User from "../../../schemas/company/user_schema";

interface get_user_roles_body {
    _id?: string,
    populate?: string,
}

export default async function get_company_user_list(req: any, res: any) {
    const user = req.user;
    const { company } = user;
    var { _id, populate } = req.query as get_user_roles_body;;

    if (!company) {
        return res.status(400).json({ message: 'Company ID is required' });
    }

    // check if the user has the permission to get user roles
    if (!check_user_permission(user, 'get_company_user_list') && !check_user_permission(user, 'company-admin') ) {
        return res.status(403).json({ message: 'No permissions' });
    };

    // get the user roles
    var args:any = {
        company: company,
    };
    if (_id  && mongoose.Types.ObjectId.isValid(_id)) {
        args._id = _id;
    }

    const roles = await User.find(args).populate(["role"]);
    return res.status(200).json(roles); 
}