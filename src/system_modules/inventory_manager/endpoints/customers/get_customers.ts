import { Request, Response } from 'express';
import { check_user_permission } from '../../../../modules/app_manager';
import { ConnectMySQLCompanyDb } from '../../../../lib/connect_sql_server';
import Company from '../../../../schemas/company/company_scema';

/**
 * id INT AUTO_INCREMENT PRIMARY KEY,
            name VARCHAR(255) NOT NULL,
            email VARCHAR(255),
            phone VARCHAR(30) NOT NULL UNIQUE, 
            address TEXT,
            is_active BOOLEAN NOT NULL DEFAULT TRUE
 */

/**
 * Method: GET
 * 
 * parameters:
 *      id: string
 *      search?: string
 *      perPage?: number 25
 *      page?: number   1
 *      with max_results?: yes
 *  */
export default async function get_customer_list(req: Request, res: Response) {
    
    const user = req.user;
    if (!user || !user.company){
        return res.status(401).json({message: 'User is not associated with any company'});
    }
    if (!check_user_permission(user, 'manage_inventory') && !check_user_permission(user, 'company-admin')) {
        return res.status(401).json({message: 'Unauthorized'});
    }

    //validate request
    let { id, search, perPage, page, max_results } = req.query as any;
    if (id){
        id = parseInt(id as string);
        if (isNaN(id)){
            return res.status(400).json({message: 'Invalid vendor id'});
        }
    }
    if (search){
        search = search.trim();
    }
    if (!perPage || typeof perPage !== 'number' || perPage < 1 || perPage > 1000){
        perPage = 25;
    } else {
        perPage = Math.floor(perPage);
    }
    if (!page || typeof page !== 'number' || page < 1){
        page = 1;
    } else {
        page = Math.floor(page);
    }
    if (!max_results){
        max_results = false;
    } else if (max_results === 'no'){
        max_results = false;
    } else {
        max_results = true;
    }

    // establish DB connection
    const company = await Company.findOne({_id: user.company});
    if (!company) {
        return res.status(400).json({message: 'Company not found'});
    }

    const conn = await ConnectMySQLCompanyDb(company);

    if (id){
        let query = `SELECT * FROM customers WHERE id = ?`;
        let [result] = await conn.query<Array<any>>(query, [id]);
        if (result.length === 0){
            return res.status(404).json({message: 'Vendor not found'});
        }
        return res.status(200).json(result[0]);
    } else {
        let query = "";
        let values = [];
        if (search){    
            query = `SELECT * FROM customers WHERE name LIKE ? OR email LIKE ? OR phone LIKE ? OR address LIKE ? LIMIT ?, ?`;
            search = `%${search}%`;
            values = [search, search, search, search, (page - 1) * perPage, perPage];
        } else {
            query = `SELECT * FROM customers LIMIT ?, ?`;
            values = [(page - 1) * perPage, perPage];
        }

        let [result] = await conn.query<Array<any>>(query, values);
        if (max_results){
            let [count] = await conn.query('SELECT COUNT(*) as count FROM customers');
            return res.status(200).json({
                data: result,
                total: count[0].count
            });
        } else {
            return res.status(200).json({
                data: result
            });
        }
    }
}