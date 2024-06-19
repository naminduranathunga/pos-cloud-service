/**
 * This Module Manages the products of the Company
 */

import { register_api_endpoint, register_user_permissions } from "../../modules/app_manager";
import config from "./config";
import create_branch from "./endpoints/create_branch";
import get_branches from "./endpoints/get_branches";
import get_company_profile from "./endpoints/get_company_profile";

/** Init the module */
export function init_module(){
    // Register available permissions
    config.permissions.forEach((permission) => {
        register_user_permissions(permission.name, permission.description, config.name);
    });

    
    register_api_endpoint({
        method: 'GET',
        route: '/company-manager/get-company-profile',
        is_protected: true,
        handler: get_company_profile,
    });


    // branches
    register_api_endpoint({
        method: 'GET',
        route: '/company-manager/branches/get',
        is_protected: true,
        handler: get_branches,
    });

    // create branch
    register_api_endpoint({
        method: 'POST',
        route: '/company-manager/branches/create',
        is_protected: true,
        handler: create_branch,
    });

}