import { Request, Response } from 'express';
import { check_user_permission } from '../../../../modules/app_manager';
import mongoose from 'mongoose';
import Branch from '../../../../schemas/company/branches_schema';
import get_next_grn_no, { use_grn_no } from '../../functions/grn_functions';
import { ConnectMySQLCompanyDb } from '../../../../lib/connect_sql_server';
import Company from '../../../../schemas/company/company_scema';
import get_next_sn_no, { use_sn_no } from '../../functions/sales_note_functions';

export interface SNBody {
    branch_id: string;
    customer_id?: number;

    sales_note_no: string;
    sale_date: string;
    sales_order_id?: number;
    sales_person_id?: string;  // User ID of the sales person
    status: "draft" | "confirmed" | "completed" | "returned" | "canceled";

    // products
    items: SalesNoteItem[];
    total_amount: number;
    discount: number;
    adjustment: number;
    tax: number;
    delivery_fee: number;

    // payment
    payment_method?: string;
    payment_status?: string;

    custom_fields: any;
    notes?: string;

};

export default async function create_sales_note(req: Request, res: Response) {
    // authenticate user
    const user = req.user;
    //const { first_name, last_name, email, password, role_id } = req.body as ComapanyUserBody;
    const { company } = user;

    if (!company) {
        return res.status(401).json({message: 'User is not associated with any company'});
    }

    if (!check_user_permission(user, 'create_sales_note') && !check_user_permission(user, 'company-admin')) {
        return res.status(401).json({message: 'Unauthorized'});
    }

    // validate request body
    const sales_note_bdy = req.body as SNBody;
    
    // validate branch_id
    if (!sales_note_bdy.branch_id || mongoose.Types.ObjectId.isValid(sales_note_bdy.branch_id) === false) {
        return res.status(400).json({message: 'Branch ID is required'});
    }
    const branch = await Branch.findOne({_id: sales_note_bdy.branch_id, company: company});
    if (!branch) {
        return res.status(400).json({message: 'Branch not found'});
    }

    // date required
    if (!sales_note_bdy.sale_date) {
        return res.status(400).json({message: 'Date is required'});
    }
    if (new Date(sales_note_bdy.sale_date).toString() === 'Invalid Date') {
        return res.status(400).json({message: 'Invalid Date'});
    }

    if (!sales_note_bdy.sales_note_no){
        sales_note_bdy.sales_note_no = await get_next_sn_no(branch);
    }


    //
    if (typeof sales_note_bdy.total_amount !== "number" || sales_note_bdy.total_amount < 0) {
        return res.status(400).json({message: 'Invalid Total Amount'});
    }

    if (typeof sales_note_bdy.discount !== "number" || sales_note_bdy.discount < 0) {
        return res.status(400).json({message: 'Invalid Discount'});
    }

    if (typeof sales_note_bdy.adjustment !== "number" || sales_note_bdy.adjustment < 0) {
        return res.status(400).json({message: 'Invalid Adjustment. Make it 0 if not used'});
    }

    if (typeof sales_note_bdy.tax !== "number" || sales_note_bdy.tax < 0) {
        return res.status(400).json({message: 'Invalid Tax. Make it 0 if not used'});
    }

    if (typeof sales_note_bdy.delivery_fee !== "number" || sales_note_bdy.delivery_fee < 0) {
        return res.status(400).json({message: 'Invalid Delivery Fee. Make it 0 if not used'});
    }

    // validate items
    if (!sales_note_bdy.items || !Array.isArray(sales_note_bdy.items) || sales_note_bdy.items.length === 0) {
        return res.status(400).json({message: 'Items are required'});
    }

    let item_total = 0;
    for (const item of sales_note_bdy.items) {
        if (typeof item.product_id !== 'number' || item.product_id < 1) {
            return res.status(400).json({message: 'Invalid Product ID'});
        }
        if (typeof item.quantity !== 'number' || item.quantity < 1) {
            return res.status(400).json({message: `Invalid Quantity for product ID: ${item.product_id}`});
        }
        if (typeof item.sale_price !== 'number' || item.sale_price < 0) {
            return res.status(400).json({message: `Invalid Sale Price for product ID: ${item.product_id}`});
        }
        if (typeof item.discount !== 'number' || item.discount < 0) {
            return res.status(400).json({message: `Invalid Discount for product ID: ${item.product_id}`});
        }

        item_total += (item.sale_price - item.discount) * item.quantity;
    }

    /**
     *  total_amount = (sale_price - discount) * quantity for all items
     *  The bill total = total_amount + tax + delivery_fee + adjustment - discount
     *  Total Discount = (discount) for all items + discount
     */
    if (item_total !== sales_note_bdy.total_amount){
        return res.status(400).json({message: 'Total Amount Mismatch'});
    }

    // status
    if (!sales_note_bdy.status) {
        sales_note_bdy.status = 'draft';
    }

    if (!['draft', 'confirmed', 'completed', 'returned', 'canceled'].includes(sales_note_bdy.status)) {
        return res.status(400).json({message: 'Invalid Status'});
    }

    const company_data = await Company.findOne({_id: company});
    if (!company_data) {
        return res.status(400).json({message: 'Company not found'});
    }

    const conn = await ConnectMySQLCompanyDb(company_data);

    conn.beginTransaction();
    try {
        // step one validate products
        let sql = `SELECT * FROM products WHERE id IN (${sales_note_bdy.items.map(p => p.product_id).join(',')})`;
        const [products] = await conn.query<any[]>(sql);
        if (products.length !== sales_note_bdy.items.length) {
            throw new Error('Invalid Products');
        }

        // final check if grn_number is already used
        sql = `SELECT * FROM sales_notes WHERE sales_note_no = ? AND branch_id = ?`;
        let [grns] = await conn.query<any[]>(sql, [sales_note_bdy.sales_note_no, branch._id.toString()]);
        if (grns.length > 0) {
            sales_note_bdy.sales_note_no = await get_next_grn_no(branch);
            if (!sales_note_bdy.sales_note_no) {
                throw new Error('Could not generate Sales Note Number. Internal Error');
            }
        }

        // insert into grn
        const fields = ['branch_id', 'sales_note_no', 'customer_id', 'sales_person_id', 'sale_date', 
            'total_amount', 'discount', 'adjustment', 'tax', 'delivery_fee', 'payment_method', 'payment_status',
            'sales_order_id', 'custom_fields', 'notes', 'status'];
        const values = [sales_note_bdy.branch_id, sales_note_bdy.sales_note_no, sales_note_bdy.customer_id||null, sales_note_bdy.sales_person_id||null, sales_note_bdy.sale_date,
            sales_note_bdy.total_amount, sales_note_bdy.discount||0, sales_note_bdy.adjustment||0, sales_note_bdy.tax||0, sales_note_bdy.delivery_fee||0, sales_note_bdy.payment_method||null, sales_note_bdy.payment_status||null,
            sales_note_bdy.sales_order_id||null, JSON.stringify(sales_note_bdy.custom_fields), sales_note_bdy.notes, sales_note_bdy.status];

        sql = `INSERT INTO sales_notes (${fields.join(',')}) VALUES (${values.map(v => '?').join(',')})`;
        let [result] = await conn.query(sql, values);
        [result] = await conn.query('SELECT LAST_INSERT_ID() as id');
        const sales_note_id = result[0].id;

        // insert into grn_products
        const product_fields = ['sales_note_id', 'product_id', 'quantity', 'sale_price', 'discount'];
        for (const p of sales_note_bdy.items) {
            const product_values = [sales_note_id, p.product_id, p.quantity, p.sale_price, p.discount];
            sql = `INSERT INTO sales_note_products (${product_fields.join(',')}) VALUES (${product_values.map(v => '?').join(',')})`;
            await conn.query(sql, product_values);
        }

        // update product stocks poducts table 'product_stocks' if not draft
        if (sales_note_bdy.status !== 'draft'){
            const insert_fields = ['branch_id', 'product_id', 'quantity', 'cost_price', 'sale_price'];
            for (const p of sales_note_bdy.items) {
                // check if record exists
                sql = `SELECT * FROM product_stocks WHERE branch_id = ? AND product_id = ? AND sale_price = ?`;
                const [stock] = await conn.query<any[]>(sql, [sales_note_bdy.branch_id, p.product_id, p.sale_price]);
                if (stock.length > 0){
                    // update quantity
                    sql = `UPDATE product_stocks SET quantity = quantity - ? WHERE id = ?`;
                    await conn.query(sql, [p.quantity, stock[0].id]);
                } else {
                    // insert new record
                    const stock_values = [sales_note_bdy.branch_id, p.product_id, -1 * p.quantity, 0, p.sale_price];
                    sql = `INSERT INTO product_stocks (${insert_fields.join(',')}) VALUES (${stock_values.map(v => '?').join(',')})`;
                    await conn.query(sql, stock_values);
                }
            }
        }

        await use_sn_no(branch, sales_note_bdy.sales_note_no);
        const new_sn:SalesNote = {
            ...sales_note_bdy,
            id: sales_note_id,

        }
        conn.commit();

        return res.status(200).json(new_sn);
        
    } catch (error) {
        conn.rollback();
        console.log(error);
        res.status(500).json({message: error.message});
    }
}