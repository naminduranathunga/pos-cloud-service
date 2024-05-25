import reserved_roles from "../../../lib/reserved_roles";
import { check_user_permission } from "../../../modules/app_manager";
import UserRole from "../../../schemas/company/user_permission_schema";
import User from "../../../schemas/company/user_schema";
import { hash } from "bcrypt";

interface ComapanyUserBody {
    first_name: string,
    last_name?: string,
    email: string,
    password: string,
    role_id: string,
}

export default async function create_company_user(req: any, res: any) {
    const user = req.user;
    const { first_name, last_name, email, password, role_id } = req.body as ComapanyUserBody;
    const { company } = user;

    if (!company) {
        return res.status(400).json({ message: 'Company ID is required' });
    }

    // check if the user has the permission to create a user role
    if (!check_user_permission(user, 'create_user_role') && !check_user_permission(user, 'company-admin') ) {
        return res.status(403).json({ message: 'No permissions' });
    };

    const userRole = await UserRole.findById(role_id);
    if (!userRole || (userRole.company && userRole.company.toString() !== company.toString())){
        res.status(400).json({
            message: "User role does not exists."
        });
        return;
    }

    if (userRole.slug in reserved_roles){
        res.status(403).json({
            message: "You are not authorized to create this account"
        });
        return;
    }

    if (!first_name || !email || !password || !role_id) {
        return res.status(400).json({ message: 'First Name, Email, Password and Role ID are required' });
    }

    // check if the email is already in use
    const users = await User.find({ email, company });
    if (users.length > 0) {
        return res.status(400).json({ message: 'Email already in use' });
    }

    const hashed_password = await hash(password, 10);

    // create the user
    const new_user = new User({
        first_name,
        last_name,
        email,
        password: hashed_password,
        role: role_id,
        company: company,
    });

    const saved_user = await new_user.save();

    return res.status(200).json(saved_user);
}