import { Request, Response } from "express";
import { check_user_permission } from "../../../../modules/app_manager";
import Company from "../../../../schemas/company/company_scema";
import { ConnectMySQLCompanyDb } from "../../../../lib/connect_sql_server";
import mongoose from "mongoose";
import Branch from "../../../../schemas/company/branches_schema";



export default async function get_sales_note_list(req: Request, res: Response) {
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
        let { branch_id, page, per_page } = req.query as { branch_id?:string, page?: any, per_page?: any};

        if (branch_id && !mongoose.Types.ObjectId.isValid(branch_id)){
            return res.status(400).json({message: "Invalid Branch"})
        }

        // get company db
        const company_ = await Company.findOne({_id: company});
        if (!company_) {
            return res.status(400).json({message: 'Company not found'});
        }

        /*const branch = await Branch.findOne({
            company: user.company,
            _id: mongoose.Types.ObjectId.createFromHexString(branch_id)
        });*/

        // get sales note
        const conn = await ConnectMySQLCompanyDb(company_);
        if (!conn) {
            return res.status(400).json({message: 'Could not connect to company database'});
        }
        if (page){
            page = parseInt(page);
            if (isNaN(page) || page < 1 ){
                page = 1;
            }
        } else {
            page = 1;
        }

        if (per_page){
            per_page = parseInt(per_page);
            if (isNaN(per_page) || per_page < 1){
                per_page = 50;
            }
        } else {
            per_page = 50;
        }

        let offset = (page - 1) * per_page;
        let results:any[];
        const select_q = `sales_notes.*, customers.name as customer_name`;
        const join_q = `LEFT JOIN customers ON customers.id = sales_notes.customer_id`
        if (branch_id){
            let sql = `SELECT ${select_q} FROM sales_notes ${join_q} WHERE branch_id = ? ORDER BY sale_date DESC, id DESC LIMIT ${offset}, ${per_page}`;
            console.log(sql);
            let [rows] = await conn.query<any[]>(sql, [branch_id]);
            results = rows;
        } else {
            let sql = `SELECT ${select_q} FROM sales_notes ${join_q} ORDER BY sale_date DESC, id DESC LIMIT ${offset}, ${per_page}`;
            let [rows] = await conn.query<any[]>(sql);
            results = rows;
        }

        const sn_list:SalesNote[] = results.map((row)=>{
            return {
                id: row.id,
                sales_note_no: row.sales_note_no,
                branch_id: row.branch_id,
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
                items: [],
            }
        });
        return res.json(sn_list);

    } catch (error) {
        if (process.env.DEBUG === "true"){
            console.log(error)
            return res.status(500).json({message: 'An error occurred', error});
        }
        return res.status(500).json({message: 'An error occurred'});
    }
}