import { Request, Response } from "express";
import { check_user_permission } from "../../../../modules/app_manager";
import Product from "../../../../schemas/product/product_schema";


interface GetProductProps {
    page?: number;  // 1 default
    per_page?: number; // 100 default
    search_term?: string;
    barcode?: string;
    status?: string; // active, inactive, all -- default all
    _id?: string;
}

export default async function get_products(req: Request, res: Response) {
    const user = req.user;
    
    if (!user.company) return res.status(400).json({message: "User does not belong to a company"});
    
    if (!check_user_permission(user, "create_product") && !check_user_permission(user, "company-admin")) {
        res.status(403).json({
            "message": "No permissions"
        });
        return;
    }

    var { page, per_page, search_term, barcode, status, _id } = req.query as GetProductProps;


    // validate request
    if (!page) page = 1;
    if (!per_page) per_page = 100;

    if (search_term) {
        search_term = search_term.trim();
    }

    var query: { company: string } = { company: user.company };
    if (search_term) {
        query["$or"] = [
            { name: { $regex: search_term, $options: "i" } },
            { sku: { $regex: search_term, $options: "i" } },
        ];
    } else if (barcode) {
        // in barcodes
        query["barcodes"] = { $in: [barcode] };
    } else if (_id){
        query['_id'] = _id;
    }

    if (status && status == "active"){
        query["is_active"] = true;
    } else if (status && status == "inactive"){
        query["is_active"] = false;
    }
    

    try {
        const products = await Product.find(query).skip((page - 1) * per_page).limit(per_page);
        res.status(200).json(products);
    } catch (error) {
        let resp = {
            message: "Error creating product"
        };
        if (process.env.DEBUG) {
            resp["error"] = error;
        }
        res.status(500).json(resp);
    }
}