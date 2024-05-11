import { Request, Response } from "express";
import ProductCategory from "../../../../schemas/product/product_category_schema";
import { AuthenticatedUser } from "../../../../interfaces/jwt_token_user";
import { check_user_permission, raise_event } from "../../../../modules/app_manager";


/**
 * Endpoint api/v1/product-manager/product-category/create
 * Protected Route
 * @param req  
 * @param res 
 */
export default async function remove_product_category(req: Request, res: Response){
    const { category_id } = req.body as {category_id?: string;};
    const {user} = req.body as {user: AuthenticatedUser};

    // get user's company
    if (!user.company) return res.status(400).json({message: "User does not belong to a company"});

    if (!check_user_permission(user, "delete_product_category") && !check_user_permission(user, "company-admin")) {
        res.status(403).json({
            "message": "No permissions"
        });
        return;
    }
    // validation 
    if (!category_id || category_id.length == 0 || !category_id.match(/^[0-9a-fA-F]{24}$/)) return res.status(400).json({message: "Invalid category_id"});
    
    // get parent category
    const category = ProductCategory.findOne({_id: category_id, company: user.company});
    if (!category) return res.status(400).json({message: "Category not found"});

    // product categories might have products, and child categories 
    //await ProductCategory.deleteOne({_id: category_id});
    const response = await raise_event('safe_delete_product_categories', {category_id}) as {status?: string, error?: string};
    
    if (response.status == "error") return res.status(400).json({message: response.error});
    
    res.status(200).json({
        "message": "Category Removed"
    });
}