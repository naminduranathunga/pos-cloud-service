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
import create_user_role from "./endpoints/create_user_role";

/** Init the module */
export function init_module(){
    // Register available permissions
    config.permissions.forEach((permission) => {
        register_user_permissions(permission.name, permission.description, config.name);
    });

    // Register Event Handlers
    /*register_event({
        event_name: 'safe_delete_product_categories',
        handler: safe_delete_product_categories,
    })*/


    // Register API Endpoints
    register_api_endpoint({
        method: 'POST',
        route: '/product-manager/product-category/create',
        is_protected: true,
        handler: create_user_role,
    });
}