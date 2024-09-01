import { Request, Response } from "express";
import { check_user_permission } from "../../../../modules/app_manager";
import { ConnectMySQLCompanyDb } from "../../../../lib/connect_sql_server";
import Company from "../../../../schemas/company/company_scema";

interface ProductStockProps {
    id: number;
}


export default async function delete_product_stock(req: Request, res: Response) {
    const user = req.user;
    
    if (!user.company) return res.status(400).json({message: "User does not belong to a company"});
    
    if (!check_user_permission(user, "create_product") && !check_user_permission(user, "company-admin")) {
        res.status(403).json({
            "message": "No permissions"
        });
        return;
    }

    var { id } = req.body as ProductStockProps;

    // validate request
    if (id && isNaN(id)){
        return res.status(400).json({message: "Invalid ID"});
    }

    const company = await Company.findOne({_id: user.company});
    const conn = await ConnectMySQLCompanyDb(company);

    const sql = `DELETE FROM product_stocks WHERE id = ?`;
    await conn.query(sql, [id]);

    res.json({message: "Product stock deleted"});
}