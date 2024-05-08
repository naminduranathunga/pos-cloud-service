import { Request, Response } from "express";
import ProductCategory from "../../../schemas/product/product_category_schema";


/**
 * Endpoint api/v1/product-manager/product-category/create
 * Protected Route
 * @param req  
 * @param res 
 */
export default function create_product_category(req: Request, res: Response){
    const { name, parent_id, user} = req.body as {name: string, parent_id?: string, user: any};

    // validation 
    
    // create product category
    const newC = new ProductCategory({
        name,
        parent: parent_id,
        company: user.company
    });

    newC.save().then((doc) => {
        res.status(200).json(doc);
    }).catch((err) => {
        res.status(400).json(err);
    });
    
}