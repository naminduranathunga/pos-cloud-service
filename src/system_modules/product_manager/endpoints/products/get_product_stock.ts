import { Request, Response } from "express";
import { check_user_permission } from "../../../../modules/app_manager";
import { ConnectMySQLCompanyDb } from "../../../../lib/connect_sql_server";
import Company from "../../../../schemas/company/company_scema";
import { ProductInventoryInterface } from "../../interfaces/product_single";


export default async function get_product_stock(req: Request, res: Response) {
    const user = req.user;
    
    if (!user.company) return res.status(400).json({message: "User does not belong to a company"});
    
    if (!check_user_permission(user, "get_products") && !check_user_permission(user, "company-admin")) {
        res.status(403).json({
            "message": "No permissions"
        });
        return;
    }

    var { id } = req.query as { id: string };

    if (!id || isNaN(parseInt(id))) {
        return res.status(400).json({message: "Product ID is required"});
    }

    let id_int = parseInt(id);
    if (id_int < 1) {
        return res.status(400).json({message: "Invalid Product ID"});
    }

    const company = await Company.findOne({_id: user.company});
    const conn = await ConnectMySQLCompanyDb(company);

    const sql = `SELECT * FROM product_stocks WHERE product_id = ?`;
    const [stock] = await conn.query<any[]>(sql, [id_int]);

    let stock_data:ProductInventoryInterface[] = [];
    if (stock) {
        stock_data = stock.map((s) => {
            return {
                id: s.id,
                branch_id: s.branch_id,
                product_id: s.product_id,
                sales_price: s.sale_price,
                cost_price: s.cost_price,
                quantity: s.quantity,
            }
        });
    }

    return res.json(stock_data);

}