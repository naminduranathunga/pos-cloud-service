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
export default async function get_product_categories(req: Request, res: Response){
    //const { parent_id} = req.body as {parent_id?: string;};
    const user = req.user;

    // get optional GET parameters , parent_id and populate
    var { parent_id } = req.query as { parent_id?: any};
    if (parent_id){
        parent_id = parseInt(parent_id);
    }

    // get user's company
    if (!user.company) return res.status(400).json({message: "User does not belong to a company"});

    if (!check_user_permission(user, "get_product_categories") && !check_user_permission(user, "company-admin")) {
        res.status(403).json({
            "message": "No permissions"
        });
        return;
    }

    // validation 
    if (parent_id && typeof(parent_id) !== "number") return res.status(400).json({message: "parent_id must be a number"});


    const company = await Company.findOne({_id: user.company});
    const conn = await ConnectMySQLCompanyDb(company);
    
    let sql = `SELECT categories.*, parent.name as parent_name 
    FROM categories 
    LEFT JOIN categories as parent ON categories.parent_id=parent.id`;
    let rows: Array<any>;
    if (parent_id) {
        sql += ` WHERE categories.parent_id = ?;`;
        [rows] = await conn.query<Array<any>>(sql, [parent_id]);
    } else {
        [rows] = await conn.query<Array<any>>(sql);
    }
    console.log(sql);
    let cats: Array<ProductCategory> = [];
    console.log(rows); 
    cats = rows.map((row) => {
        return {
            id: row.id,
            name: row.name,
            parent_id: (row.parent_id) ? {id: row.parent_id, name: row.parent_name} : null
        }
    });

    res.status(200).json(cats);
}