import { Request, Response } from 'express';
import Branch from '../../../../schemas/company/branches_schema';
import { ConnectMySQLCompanyDb } from '../../../../lib/connect_sql_server';
import Company from '../../../../schemas/company/company_scema';
import { check_user_permission } from '../../../../modules/app_manager';
import { GRNInterface } from '../../interfaces/grn_interfaces';



/**
 *  Get single GRN
 *  id / grn_number
 */
export default async function get_grn_by_id(req: Request, res: Response) {

    const user = req.user;
    if (!user || !user.company){
        return res.status(401).json({message: 'User is not associated with any company'});
    }
    if (!check_user_permission(user, 'view_inventory') && !check_user_permission(user, 'company-admin')) {
        return res.status(401).json({message: 'Unauthorized'});
    }

    const { id, grn_number } = req.query as any;
    if (!id && !grn_number) {
        return res.status(400).json({message: 'id or grn_number is required'});
    }


    // establish DB connection
    const company = await Company.findOne({_id: user.company});
    if (!company) {
        return res.status(400).json({message: 'Company not found'});
    }

    const conn = await ConnectMySQLCompanyDb(company);

    let query = "";
    if (id) {
        query = `SELECT grn.*, vendors.name as vendor_name FROM grn LEFT JOIN vendors ON grn.vendor_id = vendors.id WHERE grn.id = ?`;
    } else {
        query = `SELECT grn.*, vendors.name as vendor_name FROM grn LEFT JOIN vendors ON grn.vendor_id = vendors.id WHERE grn_number = ?`;
    }
    let [grns] = await conn.query<Array<any>>(query, [id || grn_number]);

    const grn = grns[0] as GRNInterface;

    // get products
    let [products] = await conn.query<Array<any>>('SELECT * FROM grn_products WHERE grn_id = ?', [grn.id]);
    grn.products = products.map(p => {return {
        product_id: p.product_id as number,
        quantity: p.quantity as number,
        cost_price: p.cost_price as number,
        sale_price: p.sale_price as number,
    }});

    // get branch
    const branch = await Branch.findOne({_id: grn.branch_id, company: company._id});
    grn.branch_name = branch.name as string;

    return res.status(200).json({grn});
}