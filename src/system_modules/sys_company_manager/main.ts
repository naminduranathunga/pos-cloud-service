/**
 * System Module: sys_company_manager
 *      - Get list a of companies
 *      - Register a company
 *      - Add a user to a company
 */

import { register_api_endpoint, register_event, register_user_permissions } from "../../modules/app_manager";
import config from "./config";
import create_new_company from "./endpoints/create-company";
import create_new_company_user from "./endpoints/create-company-user";
import get_company_list from "./endpoints/get-list-of-companies";
import test_mysql_endpoint from "./endpoints/test_mysql";
import create_company_database_on_creating_company from "./events/create_company_database";

/** Init the module */
export function init_module(){
    // Register available permissions
    config.permissions.forEach((permission) => {
        register_user_permissions(permission.name, permission.description, config.name);
    });

    // Register Event Handlers
    event_listners();

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
        route: `/test-db`,
        is_protected: false,
        method: "GET",
        handler: test_mysql_endpoint
    });
}

function event_listners(){
    register_event({
        event_name:"sys_company_manager/after_creating_company",
        handler: create_company_database_on_creating_company
    });
}

