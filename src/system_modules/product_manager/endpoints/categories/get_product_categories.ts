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
export default async function get_product_categories(req: Request, res: Response){
    const { parent_id} = req.body as {parent_id?: string;};
    const {user} = req.body as {user: AuthenticatedUser};

    // get user's company
    if (!user.company) return res.status(400).json({message: "User does not belong to a company"});

    if (!check_user_permission(user, "get_product_categories") && !check_user_permission(user, "company-admin")) {
        res.status(403).json({
            "message": "No permissions"
        });
        return;
    }
    // validation 
    // get parent category
    var query: { company: string, parent?: string } = { company: user.company };
    if (parent_id) {
        const parent = ProductCategory.findOne({ _id: parent_id, company: user.company });
        if (!parent) return res.status(400).json({ message: "Parent category not found" });
        query.parent = parent_id;
    }
    // create product category
    const cats = await ProductCategory.find(query);

    res.status(200).json(cats);
}