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
import create_company_user from "./endpoints/create_company_user";
import create_user_role from "./endpoints/create_user_role";
import get_company_user_list from "./endpoints/get_user_list";
import get_user_permission_list from "./endpoints/get_user_permission_list";
import get_user_roles from "./endpoints/get_user_roles";
import delete_company_user from "./endpoints/remove_company_user";
import delete_company_user_role from "./endpoints/remove_user_role";
import update_company_user from "./endpoints/update_company_user";
import update_user_role from "./endpoints/update_user_role";
import validate_user_token from "./endpoints/validate_user_token";

/** Init the module */
export function init_module(){
    // Register available permissions
    config.permissions.forEach((permission) => {
        register_user_permissions(permission.name, permission.description, config.name);
    });

    register_api_endpoint({
        method: 'GET',
        route: '/user-manager/is_token_valid',
        is_protected: true,
        handler: validate_user_token,
    });


    // Register API Endpoints
    register_api_endpoint({
        method: 'POST',
        route: '/user-manager/roles/create',
        is_protected: true,
        handler: create_user_role,
    });
    
    register_api_endpoint({
        method: 'POST',
        route: '/user-manager/roles/update',
        is_protected: true,
        handler: update_user_role,
    });

    register_api_endpoint({
        method: 'GET',
        route: '/user-manager/roles/get',
        is_protected: true,
        handler: get_user_roles,
    });

    register_api_endpoint({
        method: 'POST',
        route: '/user-manager/roles/remove',
        is_protected: true,
        handler: delete_company_user_role,
    });
    
    register_api_endpoint({
        method: 'GET',
        route: '/user-manager/roles/get_permissions',
        is_protected: true,
        handler: get_user_permission_list,
    });

    
    
    register_api_endpoint({
        method: 'GET',
        route: '/user-manager/users/get',
        is_protected: true,
        handler: get_company_user_list,
    });
    
    register_api_endpoint({
        method: 'POST',
        route: '/user-manager/users/create',
        is_protected: true,
        handler: create_company_user,
    });
    
    register_api_endpoint({
        method: 'POST',
        route: '/user-manager/users/update',
        is_protected: true,
        handler: update_company_user,
    });
    
    register_api_endpoint({
        method: 'POST',
        route: '/user-manager/users/remove',
        is_protected: true,
        handler: delete_company_user,
    });
}