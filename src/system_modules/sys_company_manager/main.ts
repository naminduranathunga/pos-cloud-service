/**
 * System Module: sys_company_manager
 *      - Get list a of companies
 *      - Register a company
 *      - Add a user to a company
 *      - Update company details
 *      - Delete a company
 *      - Get user roles
 *      - Get list of users in a company
 *      - Edit a user in a company
 *      - Create new branch
 */
import { register_api_endpoint, register_user_permissions } from "../../modules/app_manager";
import config from "./config";
import create_new_company from "./endpoints/create-company";
import create_new_company_user from "./endpoints/create-company-user";
import get_company_list from "./endpoints/get-list-of-companies";
import update_company from "./endpoints/edit-company";
import delete_company from "./endpoints/delete-company";
import get_user_role_list from "./endpoints/grt-user-rolls";
import get_user_list from "./endpoints/get-list-of-company-users";
import edit_company_user from "./endpoints/edit-company-user";
import create_new_branch from "./endpoints/branches/create-a-branch";

/** Init the module */
export function init_module(){
    // Register available permissions
    config.permissions.forEach((permission) => {
        register_user_permissions(permission.name, permission.description, config.name);
    });

    // Register Event Handlers


    // Register API Endpoints
    endpoints();
}


function endpoints() {
    /*
    register_api_endpoint({
        route: '/hello-world',
        is_protected: false,
        handler: api_endpoint_hello_world
    });
    */
    const route_prefix = "/sys-company-manager";
    const company_prefix = "/company";

    register_api_endpoint({
        route: `${route_prefix}${company_prefix}/get`,
        is_protected: true,
        method: "GET",
        handler: get_company_list
    });

    register_api_endpoint({
        route: `${route_prefix}${company_prefix}/create`,
        is_protected: true,
        method: "POST",
        handler: create_new_company
    });

    register_api_endpoint({
        route: `${route_prefix}${company_prefix}/create-user`,
        is_protected: true,
        method: "POST",
        handler: create_new_company_user
    });

    register_api_endpoint({
        route: `${route_prefix}${company_prefix}/update`,
        is_protected: true,
        method: "POST",
        handler: update_company
    });

    register_api_endpoint({
        route: `${route_prefix}${company_prefix}/delete`,
        is_protected: true,
        method: "POST",  // Method is POST for deletion
        handler: delete_company
    });

    register_api_endpoint({
        route: `${route_prefix}${company_prefix}/get-user-rolls`,
        is_protected: true,
        method: "GET",  
        handler: get_user_role_list
    });

    register_api_endpoint({
        route: `${route_prefix}${company_prefix}/get-user-list`,
        is_protected: true,
        method: "POST",  
        handler: get_user_list
    });

    register_api_endpoint({
        route: `${route_prefix}${company_prefix}/edit-user`,
        is_protected: true,
        method: "POST",  
        handler: edit_company_user
    });

    register_api_endpoint({
        route: `${route_prefix}${company_prefix}/add-branch`,
        is_protected: true,
        method: "POST",  
        handler: create_new_branch
    });
}