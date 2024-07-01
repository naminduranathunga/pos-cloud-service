import { Request, Response } from 'express';
import { check_user_permission } from '../../../../modules/app_manager';
import mongoose from 'mongoose';
import Branch from '../../../../schemas/company/branches_schema';
import get_next_grn_no, { use_grn_no } from '../../functions/grn_functions';
import { ConnectMySQLCompanyDb } from '../../../../lib/connect_sql_server';
import Company from '../../../../schemas/company/company_scema';

export interface GRNBody {
    branch_id: string;
    vendor_id?: number;

    grn_number: string;
    grn_date: string;
    invoice_number?: string;
    invoice_date?: string;
    invoice_amount: number;
    total_amount: number;
    adjustment: number;
    notes: string;

    products: {
        product_id: number;
        quantity: number;
        cost_price: number;
        sale_price: number;
    }[];
};

export default async function create_sales_order(req: Request, res: Response) {
    return res.status(200).json({});
    // authenticate user
    const user = req.user;
    //const { first_name, last_name, email, password, role_id } = req.body as ComapanyUserBody;
    const { company } = user;

    if (!company) {
        return res.status(401).json({message: 'User is not associated with any company'});
    }

    if (!check_user_permission(user, 'create_good_recive_note') && !check_user_permission(user, 'company-admin')) {
        return res.status(401).json({message: 'Unauthorized'});
    }




    // validate request body
    const grn = req.body as GRNBody;
    
    // validate branch_id
    if (!grn.branch_id || mongoose.Types.ObjectId.isValid(grn.branch_id) === false) {
        return res.status(400).json({message: 'Branch ID is required'});
    }
    const branch = await Branch.findOne({_id: grn.branch_id, company: company});
    if (!branch) {
        return res.status(400).json({message: 'Branch not found'});
    }

    // date required
    if (!grn.grn_date) {
        return res.status(400).json({message: 'Date is required'});
    }

    if (!grn.grn_number){
        grn.grn_number = await get_next_grn_no(branch);
    }

    if (!grn.grn_date){
        return res.status(400).json({message: 'GRN Date is required'});
    } else {
        if (new Date(grn.grn_date).toString() === 'Invalid Date') {
            return res.status(400).json({message: 'Invalid GRN Date'});
        }
    }

    //
    if (!grn.invoice_amount || grn.invoice_amount < 0) {
        return res.status(400).json({message: 'Invalid Invoice Amount'});
    }

    if (!grn.total_amount || grn.total_amount < 0) {
        return res.status(400).json({message: 'Invalid Total Amount'});
    }

    if (!grn.products || grn.products.length === 0) {
        return res.status(400).json({message: 'Products are required'});
    }

    const company_data = await Company.findOne({_id: company});
    if (!company_data) {
        return res.status(400).json({message: 'Company not found'});
    }

    const conn = await ConnectMySQLCompanyDb(company_data);

    conn.beginTransaction();
    try {
        // step one validate products
        let sql = `SELECT * FROM products WHERE id IN (${grn.products.map(p => p.product_id).join(',')})`;
        const [products] = await conn.query<any[]>(sql);
        if (products.length !== grn.products.length) {
            throw new Error('Invalid Products');
        }

        // calculate and verify total amount
        const tm = grn.products.reduce((acc, p) => acc + p.quantity * p.cost_price, 0);
        if (tm !== grn.total_amount) {
            throw new Error('Total Amount Mismatch');
        }

        if (grn.total_amount !== grn.adjustment + grn.invoice_amount) {
            throw new Error('Total Amount Mismatch');
        }

        // final check if grn_number is already used
        sql = `SELECT * FROM grn WHERE grn_no = ? AND branch_id = ?`;
        let [grns] = await conn.query<any[]>(sql, [grn.grn_number, branch._id.toString()]);
        if (grns.length > 0) {
            grn.grn_date = await get_next_grn_no(branch);
        }

        // insert into grn
        const fields = ['branch_id', 'vendor_id', 'grn_no', 'grn_date', 'invoice_no', 'invoice_date', 'invoice_amount', 'total_amount', 'adjustment', 'notes'];
        const values = [grn.branch_id, grn.vendor_id, grn.grn_number, grn.grn_date, grn.invoice_number, grn.invoice_date, grn.invoice_amount, grn.total_amount, grn.adjustment, grn.notes];

        sql = `INSERT INTO grn (${fields.join(',')}) VALUES (${values.map(v => '?').join(',')})`;
        let [result] = await conn.query(sql, values);
        [result] = await conn.query('SELECT LAST_INSERT_ID() as id');
        const grn_id = result[0].id;

        // insert into grn_products
        const product_fields = ['grn_id', 'product_id', 'quantity', 'cost_price', 'sale_price'];
        for (const p of grn.products) {
            const product_values = [grn_id, p.product_id, p.quantity, p.cost_price, p.sale_price];
            sql = `INSERT INTO grn_products (${product_fields.join(',')}) VALUES (${product_values.map(v => '?').join(',')})`;
            await conn.query(sql, product_values);
        }

        // update product stocks poducts table 'product_stocks'
        const insert_fields = ['branch_id', 'product_id', 'quantity', 'cost_price', 'sale_price'];
        for (const p of grn.products) {
            // check if record exists
            sql = `SELECT * FROM product_stocks WHERE branch_id = ? AND product_id = ? AND cost_price = ? AND sale_price = ?`;
            const [stock] = await conn.query<any[]>(sql, [grn.branch_id, p.product_id, p.cost_price, p.sale_price]);
            if (stock.length > 0){
                // update quantity
                sql = `UPDATE product_stocks SET quantity = quantity + ? WHERE id = ?`;
                await conn.query(sql, [p.quantity, stock[0].id]);
            } else {
                // insert new record
                const stock_values = [grn.branch_id, p.product_id, p.quantity, p.cost_price, p.sale_price];
                sql = `INSERT INTO product_stocks (${insert_fields.join(',')}) VALUES (${stock_values.map(v => '?').join(',')})`;
                await conn.query(sql, stock_values);
            }
        }

        await use_grn_no(branch, grn.grn_number);
        const new_grn = {...grn, id: grn_id};
        conn.commit();

        return res.status(200).json(new_grn);
        
    } catch (error) {
        conn.rollback();
        console.log(error);
        res.status(500).json({message: error.message});
    }
}