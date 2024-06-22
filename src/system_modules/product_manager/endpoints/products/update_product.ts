import { Request, Response } from "express";
import { check_user_permission } from "../../../../modules/app_manager";
import Company from "../../../../schemas/company/company_scema";
import { ConnectMySQLCompanyDb } from "../../../../lib/connect_sql_server";
import ProductSingle from "../../interfaces/product_single";

interface CreateProductProps {
    id: number;
    name?: string;
    sku?: string;
    inventory_type?: string;
    category?: number | null;
    is_active?: boolean;
    barcodes?: Array<string>;
    size?: string;
    weight?: string;
}

function compaire_array(a1:Array<string>, a2:Array<string>){
    if (a1.length != a2.length) return false;

    for (let i = 0; i < a1.length; i++) if (a1[i] != a2[i]) return false;
    return true;
}

export default async function update_single_product(req: Request, res: Response) {
    const user = req.user;
    
    if (!user.company) return res.status(400).json({message: "User does not belong to a company"});
    
    if (!check_user_permission(user, "update_product") && !check_user_permission(user, "company-admin")) {
        res.status(403).json({
            "message": "No permissions"
        });
        return;
    }

    var {id, name, sku, inventory_type, category, is_active, barcodes, size, weight

    } = req.body as CreateProductProps;


    const company = await Company.findOne({_id: user.company});
    const conn = await ConnectMySQLCompanyDb(company);

    try {
        conn.beginTransaction();
        let sql = `SELECT *, category_id AS category FROM products WHERE id = ?`;
        const [rows] = await conn.query<Array<any>>(sql, [id]);
        if (rows.length < 1) return res.status(400).json({message: "Product does not exist"});
        const product = rows[0] as ProductSingle;

        let changes = false;
        let filelds = [];
        let values = [];

        if (name && name != product.name) {
            filelds.push("name");
            values.push(name);
            changes = true;
        };

        if (sku && sku != product.sku) {
            // sku must be unique
            sql = `SELECT * FROM products WHERE sku = ? AND id != ?`;
            const [rows] = await conn.query<Array<any>>(sql, [sku, id]);
            if (rows.length > 0) return res.status(400).json({message: "SKU already exists"});
            filelds.push("sku");
            values.push(sku);
            changes = true;
        }

        if (inventory_type && product.inventory_type != inventory_type){
            filelds.push("inventory_type");
            values.push(inventory_type);
            changes = true;
        }

        if (typeof(is_active) !== "undefined" && is_active != product.is_active){
            filelds.push("is_active");
            if (is_active) values.push(1);
            else values.push(0);
            changes = true;
        }

        if (category && product.category != category){
            sql = `SELECT * FROM product_categories WHERE id = ?`;
            const [rows] = await conn.query<Array<any>>(sql, [category]);
            if (rows.length < 1) return res.status(400).json({message: "Category does not exist"});

            filelds.push("category_id");
            values.push(category);
            changes = true;
        }
        /* process barcodes later
        const product_bcs = ((product.barcodes && product.barcodes.length > 0)?product.barcodes:[]) as Array<string>;
        if (barcodes && !compaire_array(barcodes, product_bcs)){
            product.barcodes = barcodes;
            changes = true;
        }*/

        if (size && product.size != size){
            filelds.push("size");
            values.push(size);
            changes = true;
        }

        if (weight && product.weight != weight){
            filelds.push("weight");
            values.push(weight);
            changes = true;
        }

        if (changes){
            sql = `UPDATE products SET ${filelds.join(" = ?, ")} = ? WHERE id = ?`;
            values.push(id);
            await conn.query(sql, values);

        }

        // process barcodes
        sql = `SELECT * FROM product_barcodes WHERE product_id = ?`;
        const [bcs] = await conn.query<Array<any>>(sql, [id]);
        let bcs_to_remove = [];
        let bcs_to_add = [];
        for (let i = 0; i < bcs.length; i++){
            if (barcodes.indexOf(bcs[i].barcode) == -1) bcs_to_remove.push(bcs[i].id);
        }
        for (let i = 0; i < barcodes.length; i++){
            if (bcs.map((bc:any) => bc.barcode).indexOf(barcodes[i]) == -1) bcs_to_add.push(barcodes[i]);
        }

        if (bcs_to_remove.length > 0){
            sql = `DELETE FROM product_barcodes WHERE id IN (?)`;
            await conn.query(sql, [bcs_to_remove]);
        }

        if (bcs_to_add.length > 0){
            sql = `INSERT INTO product_barcodes (barcode, product_id) VALUES ?`;
            let values = bcs_to_add.map((bc:string) => [bc, id]);
            await conn.query(sql, [values]);
        }

        conn.commit();
        return res.status(200).json({message:"Product details updated."});
        
    } catch (error) {
        conn.rollback();
        let msg = {message: "Internal Server Error!"};
        if (process.env.DEBUG){
            msg['debug'] = error;
        }
        return res.status(500).json(msg);
    }
}