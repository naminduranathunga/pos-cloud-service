import { Request, Response } from "express";
import { check_user_permission } from "../../../../modules/app_manager";
import Company from "../../../../schemas/company/company_scema";
import { ConnectMySQLCompanyDb } from "../../../../lib/connect_sql_server";



export default async function add_note_to_sales_note(req: Request, res: Response) {
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
        const { sn_id, notes } = req.body as { sn_id: number, notes: string };
        if (typeof sn_id !== "number") {
            return res.status(400).json({message: 'Invalid Sales Note ID'});
        }
        if (typeof notes !== "string") {
            return res.status(400).json({message: 'Invalid Notes'});
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

        let sql = `UPDATE sales_notes SET notes = ? WHERE id = ?`;
        await conn.execute(sql, [notes, sn_id]);

        return res.json({message: 'Status updated successfully'});

    } catch (error) {
        return res.status(500).json({message: 'An error occurred'});
    }
}