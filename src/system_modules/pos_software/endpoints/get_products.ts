import { Request, Response } from "express";
import { check_user_permission } from "../../../modules/app_manager";
import Product from "../../../schemas/product/product_schema";
import Company from "../../../schemas/company/company_scema";
import { ConnectMySQLCompanyDb } from "../../../lib/connect_sql_server";
import ProductSingle from "../../product_manager/interfaces/product_single";


interface GetProductProps {
    page?: number;  // 1 default
    per_page?: number; // 100 default
    search_term?: string;
    barcode?: string;
    status?: string; // active, inactive, all -- default all
    id?: string;
}

// products can get either by barcode, search term, or id


export default async function get_products(req: Request, res: Response) {
    const user = req.user;
    
    if (!user.company) return res.status(400).json({message: "User does not belong to a company"});
    
    if (!check_user_permission(user, "create_product") && !check_user_permission(user, "company-admin")) {
        res.status(403).json({
            "message": "No permissions"
        });
        return;
    }

    var { page, per_page, search_term, barcode, status, id } = req.query as GetProductProps;

    // validate request
    if (!page) {
        page = 1;
    } else {
        page = parseInt(String(page));
    }

    if (!per_page){
        per_page = 100;
    } else {
        per_page = parseInt(String(per_page));
    }

    if (search_term) {
        search_term = search_term.trim();
        // remove any wildcards
        search_term = search_term.replace(/%/g, "");
        search_term = `%${search_term}%`;
    }

    const company = await Company.findOne({_id: user.company});
    const conn = await ConnectMySQLCompanyDb(company);

    const barcode_select = `
    (SELECT GROUP_CONCAT(barcode SEPARATOR ', ') 
     FROM product_barcodes 
     WHERE product_barcodes.product_id = products.id) AS barcodes`;

    const price_select = `
    (SELECT GROUP_CONCAT(sale_price SEPARATOR ', ') 
     FROM product_stocks 
     WHERE product_stocks.product_id = products.id) AS prices`;

    var sql = `SELECT products.*, ${barcode_select}, ${price_select} FROM products`;
    var vars = [];

    if (search_term) {
        sql += ` WHERE name LIKE ? OR sku LIKE ?`;
        vars.push(search_term);
        vars.push(search_term);
    } else if (barcode) {
        sql = `SELECT products.id, products.name, products.sku, products.thumbnail, products.inventory_type, products.is_active, ${barcode_select}, ${price_select} FROM products LEFT JOIN product_barcodes ON product_barcodes.product_id = products.id 
                WHERE product_barcodes.barcode = ?`;
        vars.push(barcode);
    } else if (id){
        sql += ` WHERE id = ?`;
        vars.push(id);
    } else {
        sql += ` WHERE 1`;
    }

    if (status && status == "active"){
        sql += ` AND is_active = 1`;
    } else if (status && status == "inactive"){
        sql += ` AND is_active = 0`;
    }

    let offset = (page - 1) * per_page;
    sql += ` LIMIT ?, ?`;
    vars.push(offset);
    vars.push(per_page);

    const [rows] = await conn.query<Array<any>>(sql, vars);

    let products = rows.map((row:any) => {
        const barcodes = row.barcodes.split(", ");
        const prices = row.prices ? row.prices.split(", ") : [];
        return {
            id: row.id,
            name: row.name,
            sku: row.sku,
            thumbnail: row.thumbnail,
            inventory_type: row.inventory_type,
            is_active: row.is_active,
            barcodes: barcodes,
            prices: prices,
        }
    });

    return res.json(products);
}
