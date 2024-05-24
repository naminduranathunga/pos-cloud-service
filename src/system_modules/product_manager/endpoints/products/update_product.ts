import { Request, Response } from "express";
import { AuthenticatedUser } from "../../../../interfaces/jwt_token_user";
import { check_user_permission } from "../../../../modules/app_manager";
import Product from "../../../../schemas/product/product_schema";
import mongoose from "mongoose";


interface CreateProductProps {
    _id: string;
    name?: string;
    sku?: string;
    inventory_type?: string;
    category?: string;
    is_active?: boolean;
    prices?: Array<number>;
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

    const {_id, name, sku, inventory_type, category, is_active, prices, barcodes, size, weight

    } = req.body as CreateProductProps;

    if (!mongoose.Types.ObjectId.isValid(_id)) return res.status(400).json({message: "Invalid product id."});

    try {
        const product = await Product.findOne({_id, company: user.company});
        let changes = false;

        if (!product) return res.status(400).json({message: "Invalid product id. Product not found."});
        if (name && name != product.name) {
            product.name = name;
            changes = true;
        };
        if (sku && sku != product.sku) {
            // sku must be unique
            const count = await Product.countDocuments({sku, _id: {$nin: [product._id]}, company: user.company});

            if (count > 0) return res.status(400).json({message: "SKU must be unique."});

            product.sku = sku;
            changes = true;
        }

        if (inventory_type && product.inventory_type != inventory_type){
            product.inventory_type = inventory_type;
            changes = true;
        }

        if (is_active && is_active != product.is_active){
            product.is_active = is_active;
            changes = true;
        }

        if (category && product.category != mongoose.Types.ObjectId.createFromHexString(category)){
            const categoryExists = Product.findOne({company: user.company, _id: category});
            if (!categoryExists) return res.status(400).json({message: "Category does not exist"});

            product.category = mongoose.Types.ObjectId.createFromHexString(category);
            changes = true;
        }

        const product_bcs = ((product.barcodes && product.barcodes.length > 0)?product.barcodes:[]) as Array<string>;
        if (barcodes && !compaire_array(barcodes, product_bcs)){
            product.barcodes = barcodes;
            changes = true;
        }

        if (size){
            product.size = size;
            changes = true;
        }

        if (weight){
            product.weight = weight;
            changes = true;
        }

        if (changes){
            await product.save();
            return res.status(200).json({message:"Product details updated."});
        }
        return res.status(200).json({message:"No changes have been made."});
        
    } catch (error) {
        let msg = {message: "Internal Server Error!"};
        if (process.env.DEBUG){
            msg['debug'] = error;
        }
        return res.status(500).json(msg);
    }
}