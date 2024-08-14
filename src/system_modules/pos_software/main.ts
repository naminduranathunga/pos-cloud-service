import { register_api_endpoint, register_event, register_user_permissions } from "../../modules/app_manager";
import config from "./config";
import get_company_detail from "./endpoints/get_company_details";
import get_products from "./endpoints/get_products";

/** Init the module */
export function init_module(){
    // Register available permissions
    config.permissions.forEach((permission) => {
        register_user_permissions(permission.name, permission.description, config.name);
    });

    register_api_endpoint({
        route: '/pos-software/get-company',
        is_protected: true,
        method: "GET",
        handler: get_company_detail
    });

    register_api_endpoint({
        route: '/pos-software/get-products',
        is_protected: true,
        method: "GET",
        handler: get_products
    });

}