/**
 * Configuration File for Product Manager Module
 */

export default {
    name: 'product_manager',
    description: 'This Module Manages the products of the Company',
    permissions: [
        { name: "create_product_category", description: "Create Product Category" },
        { name: "create_product", description: "Create Product" },
        { name: "get_product_categories", description: "Get Product Categories" },
        { name: "get_products", description: "Get Products" },
        { name: "update_product_category", description: "Update Product Category" },
        { name: "update_product", description: "Update Product" },
        { name: "delete_product_category", description: "Delete Product Category" },
        { name: "delete_product", description: "Delete Product" },
        { name: "add_product_images", description: "Add Product Images" },
        { name: "get_product_images", description: "Get Product Images" }
    ],
}