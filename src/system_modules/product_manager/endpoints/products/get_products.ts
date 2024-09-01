import { Request, Response } from "express";
import { check_user_permission } from "../../../../modules/app_manager";
import Product from "../../../../schemas/product/product_schema";
import Company from "../../../../schemas/company/company_scema";
import { ConnectMySQLCompanyDb } from "../../../../lib/connect_sql_server";
import ProductSingle from "../../interfaces/product_single";


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

    /*const barcode_select = `
    (SELECT GROUP_CONCAT(barcode SEPARATOR ', ') 
     FROM product_barcodes 
     WHERE product_barcodes.product_id = products.id) AS barcodes`;*/

    //var sql = `SELECT products.*, ${barcode_select} FROM products`;
    
    var vars = [];
    let where_condition = "";
    if (search_term) {
        where_condition += ` WHERE products.name LIKE ? OR products.sku LIKE ?`;
        vars.push(search_term);
        vars.push(search_term);
    } else if (barcode) {
        where_condition = ` WHERE product_barcodes.barcode = ?`;
        vars.push(barcode);
    } else if (id){
        where_condition += ` WHERE products.id = ?`;
        vars.push(id);
    } else {
        where_condition = " WHERE 1";
    }


    if (status && status == "active"){
        where_condition += ` AND products.is_active = 1`;
    } else if (status && status == "inactive"){
        where_condition += ` AND products.is_active = 0`;
    }

    
    let offset = (page - 1) * per_page;
     let limit_conds = ` LIMIT ?, ?`;
    vars.push(offset);
    vars.push(per_page);

    var sql = `SELECT 
                products.*,
                MAX(product_stocks.sale_price) as max_price,
                MIN(product_stocks.sale_price) as min_price,
                GROUP_CONCAT(DISTINCT(product_stocks.sale_price) SEPARATOR ', ') AS prices,
                GROUP_CONCAT(DISTINCT(product_barcodes.barcode) SEPARATOR ', ') AS barcodes
            FROM products
            LEFT JOIN product_stocks ON product_stocks.product_id = products.id
            LEFT JOIN product_barcodes ON product_barcodes.product_id = products.id
            ${where_condition}
            GROUP BY products.id
            ${limit_conds}`;

    const [rows] = await conn.query<Array<any>>(sql, vars);

    let products:ProductSingle[] = rows.map((row:any) => {
        const barcodes = row.barcodes?row.barcodes.split(", "):[];
        const prices = row.prices?row.prices.split(", "):[];
        return {
            id:row.id,
            name: row.name,
            sku: row.sku,
            thumbnail: row.thumbnail,
            inventory_type: row.inventory_type,
            category: row.category_id,
            is_active: row.is_active,
            size: row.size,
            weight: row.weight,
            barcodes: barcodes,
            prices: prices
        }
    });

    return res.json(products);
}
//0.0039s