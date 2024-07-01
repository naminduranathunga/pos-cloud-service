import { Request, Response } from 'express';
import { check_user_permission, raise_event } from '../../../../modules/app_manager';
import Company from '../../../../schemas/company/company_scema';
import { ConnectMySQLCompanyDb } from '../../../../lib/connect_sql_server';
import { CustomerInterface } from '../../interfaces/customers';


interface VendorBody {
    name: string;
    email?: string;
    phone: string;
    address?: string;
    is_active?: boolean;
}

export default async function create_new_customer(req: Request, res: Response) {

    const user = req.user;
    if (!user || !user.company){
        return res.status(401).json({message: 'User is not associated with any company'});
    }
    if (!check_user_permission(user, 'manage_inventory') && !check_user_permission(user, 'company-admin')) {
        return res.status(401).json({message: 'Unauthorized'});
    }

    // validate request
    let { name, email, phone, address, is_active } = req.body as VendorBody;
    if (!name) {
        return res.status(400).json({message: 'Name is required'});
    }
    if (!email) {
        email = null;
    }
    if (!phone) {
        return res.status(400).json({message: 'Phone is required'});
    }
    if (!address) {
        address = null;
    }
    if (typeof is_active !== 'boolean') {
        is_active = true;
    }

    var customer = { name, email, phone, address, is_active } as CustomerInterface;
    customer = raise_event("before_create_customer", customer, req, res);

    // establish DB connection
    const company = await Company.findOne({_id: user.company});
    if (!company) {
        return res.status(400).json({message: 'Company not found'});
    }

    const conn = await ConnectMySQLCompanyDb(company);

    let query = `INSERT INTO customers (name, email, phone, address, is_active) VALUES (?, ?, ?, ?, ?)`;
    let values = [name, email, phone, address, is_active];
    try {
        await conn.query(query, values);

        // get last inserted id
        let [result] = await conn.query('SELECT LAST_INSERT_ID() as id');
        let vendor_id = result[0].id;

        customer = { id:vendor_id, name, email, phone, address, is_active } as CustomerInterface;
        customer = raise_event("after_create_customer", customer, req, res);

        return res.status(200).json(customer);
    } catch (error) {
        console.log(error);
        return res.status(500).json({message: 'Internal Server Error'});        
    }
}