import { Request, Response } from "express";
import { check_user_permission } from "../../../../modules/app_manager";
import Company from "../../../../schemas/company/company_scema";
import { ConnectMySQLCompanyDb } from "../../../../lib/connect_sql_server";



export default async function change_sn_status(req: Request, res: Response) {
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
        const { sn_id, status } = req.body as { sn_id: number, status: string };
        if (typeof sn_id !== "number") {
            return res.status(400).json({message: 'Invalid Sales Note ID'});
        }
        if (typeof status !== "string" || ["draft", "confirmed", "delivered", "returned", "canceled"].includes(status) === false) {
            return res.status(400).json({message: 'Invalid Status'});
        }

        // constraints following are not allowed
        //      any --> draft
        if (status === "draft"){
            return res.status(403).json({message: 'Cannot changed to draft'});
        }

        // get company db
        const company_ = await Company.findOne({_id: company});
        if (!company_) {
            return res.status(400).json({message: 'Company not found'});
        }

        // get sales note
        const conn = await ConnectMySQLCompanyDb(company_);
        if (!conn) {
            return res.status(400).json({message: 'Could not connect to company database'});
        }

        let sql = `SELECT * FROM sales_notes WHERE id = ?`;
        let [rows] = await conn.query<any[]>(sql, [sn_id]);
        if (rows.length === 0){
            return res.status(400).json({message: 'Sales Note not found'});
        }
        const previous_status = rows[0].status;

        // start transaction
        conn.beginTransaction();
        try {
            sql = `UPDATE sales_notes SET status = ? WHERE id = ?`;
            await conn.execute(sql, [status, sn_id]);


            if (status !== 'draft' && previous_status === "draft"){
                const insert_fields = ['branch_id', 'product_id', 'quantity', 'cost_price', 'sale_price'];
                const branch_id = rows[0].branch_id;

                for (const p of rows[0].items as SalesNoteItem[]) {
                    // check if record exists
                    sql = `SELECT * FROM product_stocks WHERE branch_id = ? AND product_id = ? AND sale_price = ?`;
                    const [stock] = await conn.query<any[]>(sql, [branch_id, p.product_id, p.sale_price]);
                    if (stock.length > 0){
                        // update quantity
                        sql = `UPDATE product_stocks SET quantity = quantity - ? WHERE id = ?`;
                        await conn.query(sql, [p.quantity, stock[0].id]);
                    } else {
                        // insert new record
                        const stock_values = [branch_id, p.product_id, -1 * p.quantity, 0, p.sale_price];
                        sql = `INSERT INTO product_stocks (${insert_fields.join(',')}) VALUES (${stock_values.map(v => '?').join(',')})`;
                        await conn.query(sql, stock_values);
                    }
                }
            }

            conn.commit();
            return res.json({message: 'Status updated successfully'});
        } catch (error) {
            conn.rollback();
            throw error;
        }
        
        

    } catch (error) {
        console.log(error);
        return res.status(500).json({message: 'An error occurred'});
    }
}