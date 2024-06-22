import { Request, Response } from "express";
import { check_user_permission } from "../../../../modules/app_manager";
import Product from "../../../../schemas/product/product_schema";
import { unlink } from "fs/promises";
import Company from "../../../../schemas/company/company_scema";
import { ConnectMySQLCompanyDb } from "../../../../lib/connect_sql_server";
/**
 * Unlike  normal requests, this uses multer for parsing the body
 * for multipart form-data
 */


export default async function remove_thumbnail_from_product(req: Request, res: Response) {
    const user = req.user;
    
    if (!user.company) return res.status(400).json({message: "User does not belong to a company"});
    
    if (!check_user_permission(user, "create_product") && !check_user_permission(user, "company-admin")) {
        res.status(403).json({
            "message": "No permissions"
        });
        return;
    }

    var {product_id} = req.body as {product_id: any};

    // validate request
    if (!product_id) return res.status(400).json({message: "Product ID is required"});
    product_id = parseInt(product_id);

    const company = await Company.findOne({_id: user.company});
    const conn = await ConnectMySQLCompanyDb(company);

    const upload_path = process.env.UPLOADS_DIR || 'uploads';
    
    
    try{
        conn.beginTransaction();
        // check if the product exists
        let sql = `SELECT thumbnail FROM products WHERE id = ?`;
        const [rows] = await conn.query<Array<any>>(sql, [product_id]);

        if (rows.length < 1) {
            conn.rollback();
            return res.status(400).json({message: "Product does not exist"});
        }


        const full_path = `${upload_path}/${rows[0].thumbnail}`;
        await unlink(full_path);
        sql = `UPDATE products SET thumbnail = NULL WHERE id = ?`;
        await conn.query(sql, [product_id]);
        conn.commit();
        
    }catch(e){
        conn.rollback();
        let resp = {
            message: "Failed to delete thumbnail",
        }
        if (process.env.DEBUG) {
            resp["error"] = e;
        }
        return res.status(500).json(resp);
    }
    

    return res.status(200).json({message: "Thumbnail removed successfully"});
}