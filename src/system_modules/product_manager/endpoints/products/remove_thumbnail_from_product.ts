import { Request, Response } from "express";
import { check_user_permission } from "../../../../modules/app_manager";
import Product from "../../../../schemas/product/product_schema";
import { unlink } from "fs/promises";
/**
 * Unlike  normal requests, this uses multer for parsing the body
 * for multipart form-data
 */


export default async function remove_thumbnail_from_product(req: Request, res: Response) {
    const user = req.user;
    
    if (!user.company) return res.status(400).json({message: "User does not belong to a company"});
    
    if (!check_user_permission(user, "create_product") && !check_user_permission(user, "company-admin")) {
        res.status(403).json({
            "message": "No permissions"
        });
        return;
    }

    const {product_id} = req.body as {product_id: string};

    // validate request
    if (!product_id) return res.status(400).json({message: "Product ID is required"});

    const product = await Product.findOne({company: user.company, _id: product_id});
    if (!product) return res.status(400).json({message: "Product does not exist"});

    const upload_path = process.env.UPLOADS_DIR || 'uploads';
    const full_path = `${upload_path}/${product.thumbnail}`;
    
    try{
        await unlink(full_path);
        product.thumbnail = "";
        await product.save();
    }catch(e){
        let resp = {
            message: "Failed to delete thumbnail",
        }
        if (process.env.DEBUG) {
            resp["error"] = e;
        }
        return res.status(500).json(resp);
    }
    

    return res.status(200).json({message: "Thumbnail removed successfully"});
}