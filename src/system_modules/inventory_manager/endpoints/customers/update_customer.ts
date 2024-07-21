import { Request, Response } from 'express';
import { check_user_permission } from '../../../../modules/app_manager';
import { ConnectMySQLCompanyDb } from '../../../../lib/connect_sql_server';
import Company from '../../../../schemas/company/company_scema';


interface CustomerBody {
    id: number;
    name?: string;
    email?: string;
    phone?: string;
    address?: string;
    is_active?: boolean;
}

export default async function update_customer(req: Request, res: Response) {
    
    const user = req.user;
    if (!user || !user.company){
        return res.status(401).json({message: 'User is not associated with any company'});
    }
    if (!check_user_permission(user, 'manage_inventory') && !check_user_permission(user, 'company-admin')) {
        return res.status(401).json({message: 'Unauthorized'});
    }

    //validate request
    let { id, name, email, phone, address, is_active } = req.body as CustomerBody;
    if (isNaN(id) || id < 1){
        return res.status(400).json({message: 'Invalid vendor id'});
    }
    if (typeof is_active !== "undefined" && typeof is_active !== 'boolean') {
        return res.status(400).json({message: 'Invalid is_active value'});
    }
    

    // establish DB connection
    const company = await Company.findOne({_id: user.company});
    if (!company) {
        return res.status(400).json({message: 'Company not found'});
    }

    const conn = await ConnectMySQLCompanyDb(company);

    // get the vendor
    let [vendors] = await conn.query<Array<any>>('SELECT * FROM customers WHERE id = ?', [id]);
    if (vendors.length === 0){
        return res.status(400).json({message: 'Customer not found'});
    }
    let vendor = vendors[0];

    let update_params = [];
    let update_values = [];

    if (name){
        update_params.push('name = ?');
        update_values.push(name);
    }
    if (email){
        update_params.push('email = ?');
        update_values.push(email);
    }
    if (phone){
        update_params.push('phone = ?');
        update_values.push(phone);
    }
    if (address){
        update_params.push('address = ?');
        update_values.push(address);
    }
    if (typeof is_active === 'boolean'){
        update_params.push('is_active = ?');
        update_values.push(is_active);
    }

    if (update_params.length === 0){
        return res.status(200).json({message: 'No update parameters provided'});
    }

    let query = `UPDATE customers SET ${update_params.join(', ')} WHERE id = ?`;
    update_values.push(id);
    await conn.query(query, update_values);

    return res.status(200).json({message: 'Customer updated successfully'});
}