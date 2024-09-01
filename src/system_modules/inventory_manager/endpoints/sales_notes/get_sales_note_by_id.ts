import { Request, Response } from "express";
import { check_user_permission } from "../../../../modules/app_manager";
import Company from "../../../../schemas/company/company_scema";
import { ConnectMySQLCompanyDb } from "../../../../lib/connect_sql_server";
import mongoose from "mongoose";
import Branch from "../../../../schemas/company/branches_schema";



export default async function get_sales_note_by_id(req: Request, res: Response) {
    const user = req.user;
    //const { first_name, last_name, email, password, role_id } = req.body as ComapanyUserBody;
    const { company } = user;

    if (!company) {
        return res.status(401).json({message: 'User is not associated with any company'});
    }

    if (!check_user_permission(user, 'create_sales_note') && !check_user_permission(user, 'company-admin')) {
        return res.status(401).json({message: 'Unauthorized'});
    }

    try {
        let { id, sn_nmmber, branch_id } = req.query as { id?: any, sn_nmmber?: any, branch_id?:string};
        
        if (!id){
            if (!branch_id || !sn_nmmber){
                return res.status(400).json({message:"id or, branch_id and sn_number is required."})
            }
            if (!mongoose.Types.ObjectId.isValid(branch_id)){
                return res.status(400).json({message:"Branch_id is invalid."})
            }

        }

        // get company db
        const company_ = await Company.findOne({_id: company});
        if (!company_) {
            return res.status(400).json({message: 'Company not found'});
        }

        /*;*/

        // get sales note
        const conn = await ConnectMySQLCompanyDb(company_);
        if (!conn) {
            return res.status(400).json({message: 'Could not connect to company database'});
        }
        

        let sql = `
            SELECT sales_notes.*, customers.name as customer_name
            FROM sales_notes
            LEFT JOIN customers ON customers.id = sales_notes.customer_id
            WHERE ${(id?'sales_notes.id = ?':'sales_notes.sales_note_no = ? AND branch_id = ?')}
        `;
        let params: any[];
        if (id){
            params = [id];
        } else {
            params = [sn_nmmber, branch_id];
        }

        const [rows] = await conn.query<any[]>(sql, params);

        if (rows.length === 0){
            return res.status(404).json({message: 'Sales Note not found'});
        }

        const row = rows[0];

        // get items 
        sql = `SELECT sales_note_products.*, products.name as product_name FROM sales_note_products LEFT JOIN products ON products.id = sales_note_products.product_id WHERE sales_note_id = ?`;
        const [items] = await conn.query<any[]>(sql, [row.id]);

        const sn_items:SalesNoteItem[] = items.map((item)=>{
            return {
                id: item.id,
                product_id: item.product_id,
                quantity: item.quantity,
                sale_price: item.sale_price,
                discount: item.discount,
                sales_note_id: item.sales_note_id,
                product_name: item.product_name,
            }
        })
        const branch = await Branch.findOne({
            company: user.company,
            _id: mongoose.Types.ObjectId.createFromHexString(row.branch_id)
        })

        const sn:SalesNote = {
            id: row.id,
            sales_note_no: row.sales_note_no,
            branch_id: row.branch_id,
            branch_name: (branch?.name as string)||null,
            customer_id: row.customer_id||null,
            customer_name: row.customer_name || null,
            sales_person_id: row.sales_person_id||null,
            sale_date: new Date(row.sale_date),
            total_amount: parseFloat(row.total_amount),
            discount: parseFloat(row.discount),
            adjustment: parseFloat(row.adjustment),
            tax: parseFloat(row.adjustment),
            delivery_fee: parseFloat(row.delivery_fee),

            payment_method: row.payment_method||null,
            payment_status: row.payment_status||null,

            sales_order_id: row.sales_order_id||null,
            custom_fields: row.custom_fields||null,
            notes: row.notes||null,
            status: row.status,
            created_at: new Date(row.created_at),
            items: sn_items,
        }
        return res.json(sn);

    } catch (error) {
        return res.status(500).json({message: 'An error occurred'});
    }
}