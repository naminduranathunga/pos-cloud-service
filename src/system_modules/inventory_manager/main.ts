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
import create_new_customer from "./endpoints/customers/create_new_customer";
import get_customer_list from "./endpoints/customers/get_customers";
import update_customer from "./endpoints/customers/update_customer";
import create_good_recive_note from "./endpoints/grn/create_good_recive_note";
import get_grn_by_id from "./endpoints/grn/get_grn";
import get_grn_list from "./endpoints/grn/get_grn_list";
import get_next_grn_number from "./endpoints/grn/get_next_grn_number";
import add_note_to_sales_note from "./endpoints/sales_notes/add_note_to_sales_note";
import change_sn_status from "./endpoints/sales_notes/change_sn_status";
import create_sales_note from "./endpoints/sales_notes/create_sales_note";
import get_next_sn_number_req from "./endpoints/sales_notes/get_next_sn_number";
import get_sales_note_by_id from "./endpoints/sales_notes/get_sales_note_by_id";
import get_sales_note_list from "./endpoints/sales_notes/get_sales_note_list";
import create_new_vendor from "./endpoints/vendors/create_new_vendor";
import get_vendor_list from "./endpoints/vendors/get_vendors";
import update_vendor from "./endpoints/vendors/update_new_vendor";


/** Init the module */
export function init_module(){
    // Register available permissions
    config.permissions.forEach((permission) => {
        register_user_permissions(permission.name, permission.description, config.name);
    });

    register_endpoints();
}


function register_endpoints(){
    // GRN Endpoints 
    register_api_endpoint({
        route: '/inventory-manager/grn/get-next-grn-number',
        method: 'GET',
        is_protected: true,
        handler: get_next_grn_number
    });
    register_api_endpoint({
        route: '/inventory-manager/grn/create',
        method: 'POST',
        is_protected: true,
        handler: create_good_recive_note
    });
    register_api_endpoint({
        route: '/inventory-manager/grn/get',
        method: 'GET',
        is_protected: true,
        handler: get_grn_list
    });
    register_api_endpoint({
        route: '/inventory-manager/grn/get-one',
        method: 'GET',
        is_protected: true,
        handler: get_grn_by_id
    });


    // SN Endpoints 
    register_api_endpoint({
        route: '/inventory-manager/sn/get-next-sn-number',
        method: 'GET',
        is_protected: true,
        handler: get_next_sn_number_req
    });
    register_api_endpoint({
        route: '/inventory-manager/sn/create',
        method: 'POST',
        is_protected: true,
        handler: create_sales_note
    });
    register_api_endpoint({
        route: '/inventory-manager/sn/get',
        method: 'GET',
        is_protected: true,
        handler: get_sales_note_list
    });
    register_api_endpoint({
        route: '/inventory-manager/sn/get-one',
        method: 'GET',
        is_protected: true,
        handler: get_sales_note_by_id
    });
    register_api_endpoint({
        route: '/inventory-manager/sn/add-notes',
        method: 'POST',
        is_protected: true,
        handler: add_note_to_sales_note
    });
    register_api_endpoint({
        route: '/inventory-manager/sn/change-status',
        method: 'POST',
        is_protected: true,
        handler: change_sn_status
    });

    // Customer Endpoints
    register_api_endpoint({
        route: '/inventory-manager/customers/create',
        method: 'POST',
        is_protected: true,
        handler: create_new_customer
    });
    register_api_endpoint({
        route: '/inventory-manager/customers/update',
        method: 'POST',
        is_protected: true,
        handler: update_customer
    });
    register_api_endpoint({
        route: '/inventory-manager/customers/get',
        method: 'GET',
        is_protected: true,
        handler: get_customer_list
    });
    

    // Vendor Endpoints
    register_api_endpoint({
        route: '/inventory-manager/vendors/create',
        method: 'POST',
        is_protected: true,
        handler: create_new_vendor
    });
    register_api_endpoint({
        route: '/inventory-manager/vendors/update',
        method: 'POST',
        is_protected: true,
        handler: update_vendor
    });
    register_api_endpoint({
        route: '/inventory-manager/vendors/get',
        method: 'GET',
        is_protected: true,
        handler: get_vendor_list
    });
}