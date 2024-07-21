/**
 * Configuration File for Product Manager Module
 */

export default {
    name: 'product_manager',
    description: 'This Module Manages the products of the Company',
    permissions: [
        { name: "manage_inventory", description: "Manage All Inventory Actions" },
        { name: "view_inventory", description: "View Inventory Related Data" },
    ],
}