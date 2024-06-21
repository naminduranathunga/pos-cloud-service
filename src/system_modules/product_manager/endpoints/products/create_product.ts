import { Request, Response } from "express";
import { check_user_permission } from "../../../../modules/app_manager";
import Product from "../../../../schemas/product/product_schema";
import mongoose from "mongoose";
import Company from "../../../../schemas/company/company_scema";
import { ConnectMySQLCompanyDb } from "../../../../lib/connect_sql_server";
import ProductSingle from "../../interfaces/product_single";


interface CreateProductProps {
    name: string;
    sku: string;
    inventory_type: string;
    category?: number;
    is_active: boolean;
    prices: Array<number>;
    barcodes?: Array<string>;
    size: string;
    weight: string;
}

export default async function create_single_product(req: Request, res: Response) {
    const user = req.user;
    
    if (!user.company) return res.status(400).json({message: "User does not belong to a company"});
    
    if (!check_user_permission(user, "create_product") && !check_user_permission(user, "company-admin")) {
        res.status(403).json({
            "message": "No permissions"
        });
        return;
    }

    const {name, sku, inventory_type, category, is_active, prices, barcodes, size, weight

    } = req.body as CreateProductProps;

    // validate request
    if (!name) return res.status(400).json({message: "Name is required"});
    if (!sku) return res.status(400).json({message: "SKU is required"});
    if (!inventory_type) return res.status(400).json({message: "Inventory type is required"});
    
    if (!is_active) return res.status(400).json({message: "is_active is required"});
    if (!prices) return res.status(400).json({message: "Price is required"});

    if (category){
        const categoryExists = Product.findOne({company: user.company, _id: category});
        if (!categoryExists) return res.status(400).json({message: "Category does not exist"});
    }

    const company = await Company.findOne({_id: user.company});
    const conn = await ConnectMySQLCompanyDb(company);

    // check if sku exists
    let sql = `SELECT * FROM products WHERE sku = ?;`;
    let [rows] = await conn.query<Array<any>>(sql, [sku]);
    if (rows.length > 0) return res.status(400).json({message: "SKU already exists"});

    // check if category exists
    if (category){
        sql = `SELECT * FROM categories WHERE id = ?;`;
        [rows] = await conn.query<Array<any>>(sql, [category]);
        if (rows.length === 0) return res.status(400).json({message: "Category does not exist"});
    }

    // create the product
    var product:ProductSingle = {
        name,
        sku,
        inventory_type,
        category: (category) ? category : null,
        is_active,
        size,
        weight,
    };
    // start transaction
    //await conn.beginTransaction();

    // turn off autocommit
    await conn.query("SET autocommit = 0");
    await conn.query("START TRANSACTION");
    try {
        sql = `
        INSERT INTO products (name, sku, inventory_type, category_id, is_active, size, weight) 
        VALUES (?, ?, ?, ?, ?, ?, ?);`;
        let [row] = await conn.query(sql, [name, sku, inventory_type, (category?category:null), is_active, size, weight]);
        // get the id
        sql = `SELECT LAST_INSERT_ID() as id;`;
        [row] = await conn.query(sql);
        const id = row[0].id;
        product.id = id;

        // adding barcodes
        product.barcodes = [];
        if (barcodes){
            for (let barcode of barcodes){
                sql = `INSERT INTO product_barcodes (barcode, product_id) VALUES (?, ?);`;
                await conn.query(sql, [barcode, id]);
                product.barcodes.push(barcode);
            }
        }
    } catch (error) {
        conn.rollback();
        throw error;
    }

    conn.commit();
    res.status(200).json(product);
}