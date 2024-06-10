import Company from "../../../schemas/company/company_scema";
import { check_user_permission } from "../../../modules/app_manager";

export default async function update_company(req, res) {
    const user = req.user;
    const { _id, name, address, phone, email, brn } = req.body;

    if (!user) {
        return res.status(401).json({ message: 'Unauthorized' });
    }

    // Check if the user has permission to update the company details
    if (!check_user_permission(user, 'update_company') && !check_user_permission(user, 'company-admin')) {
        return res.status(403).json({ message: 'No permissions' });
    }

    // Find the company by ID
    const company = await Company.findById(_id);
    if (!company) {
        return res.status(404).json({ message: 'Company not found' });
    }

    let is_edited = false;

    if (name && name !== company.name) {
        company.name = name;
        is_edited = true;
    }

    if (address && address !== company.address) {
        company.address = address;
        is_edited = true;
    }

    if (phone && phone !== company.phone) {
        company.phone = phone;
        is_edited = true;
    }

    if (email && email !== company.email) {
        company.email = email;
        is_edited = true;
    }

    if (brn && brn !== company.brn) {
        company.brn = brn;
        is_edited = true;
    }

    if (is_edited) {
        await company.save();
        return res.status(200).json(company);
    } else {
        return res.status(400).json({ message: 'No changes' });
    }
}