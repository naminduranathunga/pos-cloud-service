import e, { Request, Response } from 'express';
import Branch from '../../../../schemas/company/branches_schema';
import mongoose from 'mongoose';
import { ConnectMySQLCompanyDb } from '../../../../lib/connect_sql_server';
import Company from '../../../../schemas/company/company_scema';

export default async function get_grn_list(req: Request, res: Response) {
    const user = req.user;
    //const { first_name, last_name, email, password, role_id } = req.body as ComapanyUserBody;
    const { company } = user;
    if (!user.company) return res.status(400).json({message: "User does not belong to a company"});

    let {branch_id, page, per_page, id } = req.query as { branch_id: string, page: any, per_page: any, id: any};
    if (!branch_id){
        return res.status(400).json({message: "branch_id is required."});
    }

    const company_ = await Company.findOne({_id: company});
    const branch = await Branch.findOne({
        company: user.company,
        _id: mongoose.Types.ObjectId.createFromHexString(branch_id)
    });

    if (!branch){
        return res.status(400).json({message: "branch_id is invalid."});
    }

    const conn = await ConnectMySQLCompanyDb(company_);
    if (!conn){
        return res.status(400).json({message: "Could not connect to company database."});
    }

    if (page && typeof page === 'string'){
        page = parseInt(page);
    } else {
        page = 1;
    }

    if (per_page && typeof per_page === 'string'){
        per_page = parseInt(per_page);
    } else {
        per_page = 10;
    }

    let sql = `SELECT grn.*, vendors.name AS vendor_name FROM grn LEFT JOIN vendors ON vendors.id = grn.vendor_id WHERE branch_id = ? ORDER BY grn_date DESC, grn.id DESC`;
    let rows: Array<any> = [];
    if (id && typeof id === 'string'){
        id = parseInt(id);
        sql = `SELECT grn.*, vendors.name AS vendor_name FROM grn LEFT JOIN vendors ON vendors.id = grn.vendor_id WHERE branch_id = ? AND id = ?`;
        [rows] = await conn.execute<Array<any>>(sql, [branch_id, id]);
    } else {
        id = undefined;
        console.log([branch_id, per_page, (page - 1) * per_page]);
        [rows] = await conn.execute<Array<any>>(sql, [branch_id]);
    }


    
    if (!id){
        return res.json(rows);
    }

    if (rows.length === 0){
        return res.status(404).json({message: "GRN not found."});
    }

    // get grn products
    // const grn = rows[0];
    //grn.grn_number = rows[0].grn_no;
    //grn.grn_date = rows[0].grn_date;
    // const [products] = await conn.execute('SELECT * FROM grn_products WHERE grn_id = ?', [grn.id]);
    // grn.products = products;
    return res.json(rows);
}