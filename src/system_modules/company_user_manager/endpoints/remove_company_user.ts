import { check_user_permission } from "../../../modules/app_manager";
import User from "../../../schemas/company/user_schema";

interface ComapanyUserBody {
    _id: string,
}

export default async function delete_company_user(req: any, res: any) {
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

    // get the user
    const user_todel = await User.findOne({_id: _id, company: company}).populate('role') as any;
    if (!user_todel){
        return res.status(400).json({ message: 'User not found' });
    }

    // check if the user is the only admin
    if (user_todel.role.slug === 'company-admin' || user_todel._id === user._id){
        const admins = await User.find({company: company, role: user_todel.role});
        if (admins.length === 1){
            return res.status(400).json({ message: 'You cannot delete the only admin' });
        }
    }

    // delete the user
    await user_todel.deleteOne();

    return res.status(200).json({ message: 'User deleted' });

}