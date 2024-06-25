import { Request, Response } from "express";
//import ProductCategory from "../../../../schemas/product/product_category_schema";
import { AuthenticatedUser } from "../../../../interfaces/jwt_token_user";
import { check_user_permission } from "../../../../modules/app_manager";
import { ConnectMySQLCompanyDb } from "../../../../lib/connect_sql_server";
import Company from "../../../../schemas/company/company_scema";
import ProductCategory from "../../interfaces/product_category";


/**
 * Endpoint api/v1/product-manager/product-category/create
 * Protected Route
 * @param req  
 * @param res 
 */
export default async function create_product_category(req: Request, res: Response){
    const { name, parent_id} = req.body as {name: string, parent_id?: number;};
    const user = req.user;

    // get user's company
    if (!user.company) return res.status(400).json({message: "User does not belong to a company"});
    
    if (!check_user_permission(user, "create_product_category") && !check_user_permission(user, "company-admin")) {
        res.status(403).json({
            "message": "No permissions 5"
        });
        return;
    }

    // validation 
    if (!name) return res.status(400).json({message: "Name is required"});
    if (parent_id && typeof(parent_id) !== "number") return res.status(400).json({message: "parent_id must be a number"});
    if (parent_id && parent_id <= 0) return res.status(400).json({message: "Invalid parent_id"});
    
    const company = await Company.findOne({_id: user.company});
    const conn = await ConnectMySQLCompanyDb(company);

    // get parent category
    if (parent_id) {
        let sql = `SELECT * FROM categories WHERE id = ?;`;
        let [rows] = await conn.query<Array<any>>(sql, [parent_id]);
        if (rows.length === 0) return res.status(400).json({message: "Parent category not found"});
    }
    

    let sql = `INSERT INTO categories (name, parent_id) VALUES (?, ?);`;
    let [row] = await conn.query(sql, [name, ((parent_id) ? parent_id : null)]);
    // get the id
    sql = `SELECT LAST_INSERT_ID() as id;`;
    [row] = await conn.query(sql);
    const id = row[0].id;
    const newCat:ProductCategory = {
        id,
        name,
        parent_id: (parent_id) ? parent_id : null
    };
    res.status(200).json(newCat);
}