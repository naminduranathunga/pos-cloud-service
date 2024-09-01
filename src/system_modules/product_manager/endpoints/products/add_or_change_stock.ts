import { Request, Response } from "express";
import { check_user_permission } from "../../../../modules/app_manager";
import { ConnectMySQLCompanyDb } from "../../../../lib/connect_sql_server";
import Company from "../../../../schemas/company/company_scema";
import mongoose from "mongoose";
import { ProductInventoryInterface } from "../../interfaces/product_single";

interface ProductStockProps {
    id?: number;
    branch_id?: number;
    product_id: number;
    sales_price: number;
    cost_price: number;
    quantity: number;
}


export default async function add_or_change_stock(req: Request, res: Response) {
    const user = req.user;
    
    if (!user.company) return res.status(400).json({message: "User does not belong to a company"});
    
    if (!check_user_permission(user, "create_product") && !check_user_permission(user, "company-admin")) {
        res.status(403).json({
            "message": "No permissions"
        });
        return;
    }

    var { id, branch_id, product_id, sales_price, cost_price, quantity } = req.body as ProductStockProps;

    // validate request
    if (id && isNaN(id)){
        return res.status(400).json({message: "Invalid ID"});
    }
    if (!product_id || isNaN(product_id)){
        return res.status(400).json({message: "Product ID is required"});
    }

    if (!branch_id || !mongoose.Types.ObjectId.isValid(branch_id)){
        return res.status(400).json({message: "Branch ID is required"});
    }

    if (!sales_price || isNaN(sales_price)){
        return res.status(400).json({message: "Sales Price is required"});
    }

    if (!cost_price || isNaN(cost_price)){
        return res.status(400).json({message: "Cost Price is required"});
    }

    if (!quantity || isNaN(quantity)){
        return res.status(400).json({message: "Quantity is required"});
    }

    if (quantity <= 0){
        return res.status(400).json({message: "Quantity must be greater than 0"});
    }

    const company = await Company.findOne({_id: user.company});
    const conn = await ConnectMySQLCompanyDb(company);


    if (id) {
        // update stock
        const sql = `UPDATE product_stocks SET branch_id = ?, product_id = ?, sale_price = ?, cost_price = ?, quantity = ? WHERE id = ?`;
        await conn.query(sql, [branch_id, product_id, sales_price, cost_price, quantity, id]);
        
    } else {
        // add stock
        const sql = `INSERT INTO product_stocks (branch_id, product_id, sale_price, cost_price, quantity) VALUES (?, ?, ?, ?, ?)`;
        await conn.query(sql, [branch_id, product_id, sales_price, cost_price, quantity]);
        const [rows] = await conn.query(`SELECT LAST_INSERT_ID() as id`);
        id = rows[0].id;
    }


    const pi:ProductInventoryInterface = {
        id: id,
        branch_id: branch_id.toString(),
        product_id: product_id,
        sales_price: sales_price,
        cost_price: cost_price,
        quantity: quantity
    }
    return res.json(pi);
}