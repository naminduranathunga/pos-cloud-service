import { Request, Response } from "express";
import { AuthenticatedUser } from "../../../../interfaces/jwt_token_user";
import { check_user_permission } from "../../../../modules/app_manager";
import Product from "../../../../schemas/product/product_schema";


interface CreateProductProps {
    name: string;
    sku: string;
    inventory_type: string;
    category: string;
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

    const newProduct = new Product({
        company: user.company,
        name,
        sku,
        inventory_type,
        category,
        is_active,
        prices: prices,
        barcodes: barcodes || [],   
        size: size || "",
        weight: weight || 0
    });

    try {
        const savedProduct = await newProduct.save();
        res.status(200).json(savedProduct);
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