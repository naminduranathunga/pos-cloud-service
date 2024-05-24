/**
 * Deleting a product categories is not a safe operation, as it might have products and child categories
 * 
 * This function will check if the category has products or child categories, and if it does, it will return an error
 */

import mongoose from "mongoose";
import { raise_event } from "../../../../modules/app_manager";
import ProductCategory from "../../../../schemas/product/product_category_schema";

export interface safe_delete_product_categories_params {
    category_id: string;
}

export interface safe_delete_product_categories_response {
    status?: string;
    error?: string;
}

export async function safe_delete_product_categories(data: any){
    try {
        const {category_id} = data as safe_delete_product_categories_params;
        if (!category_id || !mongoose.Types.ObjectId.isValid(category_id)) throw new Error("Invalid category_id");

        const category = await ProductCategory.findById(category_id);
        if (!category) throw new Error("Category not found");

        // check if the category has child categories
        const child_categories = await ProductCategory.find({parent: category._id});

        // what is the hacker might create thousands of child categories, and the child categories have child categories...

        if (child_categories.length > 0){
            await Promise.all(child_categories.map(async (child) => {
                const response = await raise_event('safe_delete_product_categories', {category_id: child._id}) as safe_delete_product_categories_response;
                if (response.status == "error") throw new Error(response.error);
            }))
        }
        

        // check if the category has products
        
    } catch (error) {
        return {status: "error", error: error.message} ;
    }
    return { status: "ok" };
}
