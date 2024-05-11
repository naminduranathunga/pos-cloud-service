/**
 * This Module Manages the products of the Company
 *  - Create Product Categories
 *  - Create Products
 *  - Get Product Categories
 *  - Get Products
 *  - Update Product Categories
 *  - Update Products
 *  - Delete Product Categories
 *  - Delete Products
 *  - Add Product Images
 *  - Get Product Images
 *  - Delete Product Images
 * 
 */

import { register_api_endpoint, register_event, register_user_permissions } from "../../modules/app_manager";
import config from "./config";
import create_product_category from "./endpoints/categories/create_product_category";
import get_product_categories from "./endpoints/categories/get_product_categories";
import remove_product_category from "./endpoints/categories/remove_product_category";
import { safe_delete_product_categories } from "./events/categories/safe_delete_product_categories";

/** Init the module */
export function init_module(){
    // Register available permissions
    config.permissions.forEach((permission) => {
        register_user_permissions(permission.name, permission.description, config.name);
    });

    // Register Event Handlers
    register_event({
        event_name: 'safe_delete_product_categories',
        handler: safe_delete_product_categories,
    })


    // Register API Endpoints
    register_api_endpoint({
        method: 'POST',
        route: '/product-manager/product-category/create',
        is_protected: true,
        handler: create_product_category,
    });

    register_api_endpoint({
        method: 'GET',
        route: '/product-manager/product-category/get',
        is_protected: true,
        handler: get_product_categories,
    });

    register_api_endpoint({
        method: 'POST',
        route: '/product-manager/product-category/remove',
        is_protected: true,
        handler: remove_product_category,
    });



    
}