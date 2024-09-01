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
import add_or_change_stock from "./endpoints/products/add_or_change_stock";
import add_thumbnail_for_product, { add_thumbnail_upload_multer } from "./endpoints/products/add_thumbnail_for_product";
import create_single_product from "./endpoints/products/create_product";
import delete_product_stock from "./endpoints/products/delete_product_stock";
import get_product_stock from "./endpoints/products/get_product_stock";
import get_product_thumbnail from "./endpoints/products/get_product_thumbnail";
import get_products from "./endpoints/products/get_products";
import remove_thumbnail_from_product from "./endpoints/products/remove_thumbnail_from_product";
import update_single_product from "./endpoints/products/update_product";
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



    register_api_endpoint({
        method: 'POST',
        route: '/product-manager/products/create',
        is_protected: true,
        handler: create_single_product,
    });

    register_api_endpoint({
        method: 'POST',
        route: '/product-manager/products/update',
        is_protected: true,
        handler: update_single_product,
    });

    register_api_endpoint({
        method: 'GET',
        route: '/product-manager/products/get',
        is_protected: true,
        handler: get_products,
    });

    register_api_endpoint({
        method: 'POST',
        route: '/product-manager/products/add-thumbnail',
        is_protected: true,
        handler: add_thumbnail_for_product,
        middlewares: [
            add_thumbnail_upload_multer
        ]
    });

    register_api_endpoint({
        method: 'GET',
        route: '/product-manager/products/get-thumbnail',
        is_protected: false,
        handler: get_product_thumbnail,
    });

    register_api_endpoint({
        method: 'POST',
        route: '/product-manager/products/remove-thumbnail',
        is_protected: true,
        handler: remove_thumbnail_from_product,
    });

    
    register_api_endpoint({
        method: 'GET',
        route: '/product-manager/products/get-stocks',
        is_protected: true,
        handler: get_product_stock,
    });
    register_api_endpoint({
        method: 'POST',
        route: '/product-manager/products/add-stocks',
        is_protected: true,
        handler: add_or_change_stock,
    });
    register_api_endpoint({
        method: 'POST',
        route: '/product-manager/products/remove-stocks',
        is_protected: true,
        handler: delete_product_stock,
    });

}