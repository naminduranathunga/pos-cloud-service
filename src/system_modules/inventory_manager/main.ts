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
import get_next_grn_number from "./endpoints/grn/get_next_grn_number";


/** Init the module */
export function init_module(){
    // Register available permissions
    config.permissions.forEach((permission) => {
        register_user_permissions(permission.name, permission.description, config.name);
    });

    register_endpoints();
}


function register_endpoints(){
    register_api_endpoint({
        route: '/inventory-manager/grn/get-next-grn-number',
        method: 'GET',
        is_protected: true,
        handler: get_next_grn_number
    })
}