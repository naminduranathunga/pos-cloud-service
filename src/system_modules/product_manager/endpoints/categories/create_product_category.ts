import { Request, Response } from "express";
import ProductCategory from "../../../../schemas/product/product_category_schema";
import { AuthenticatedUser } from "../../../../interfaces/jwt_token_user";
import { check_user_permission } from "../../../../modules/app_manager";


/**
 * Endpoint api/v1/product-manager/product-category/create
 * Protected Route
 * @param req  
 * @param res 
 */
export default async function create_product_category(req: Request, res: Response){
    const { name, parent_id} = req.body as {name: string, parent_id?: string;};
    const user = req.user;

    // get user's company
    if (!user.company) return res.status(400).json({message: "User does not belong to a company"});
    
    if (!check_user_permission(user, "create_product_category") && !check_user_permission(user, "company-admin")) {
        res.status(403).json({
            "message": "No permissions 5"
        });
        return;
    }

    // validation 
    if (!name) return res.status(400).json({message: "Name is required"});
    if (parent_id && parent_id.length > 0 && !parent_id.match(/^[0-9a-fA-F]{24}$/)) return res.status(400).json({message: "Invalid parent_id"});
    
    // get parent category
    if (parent_id) {
        const parent = ProductCategory.findOne({_id: parent_id, company: user.company});
        if (!parent) return res.status(400).json({message: "Parent category not found"});
    }
    // create product category
    const newC = new ProductCategory({
        name,
        parent: (parent_id) ? parent_id : null,
        company: user.company
    });

    newC.save().then((doc) => {
        res.status(200).json(doc);
    }).catch((err) => {
        res.status(400).json(err);
    });
    
}