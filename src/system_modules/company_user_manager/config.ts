/**
 * Configuration File for Product Manager Module
 */

export default {
    name: 'product_manager',
    description: 'This Module Manages the products of the Company',
    permissions: [
        { name: "get_user_role", description: "Read User Roles" },
        { name: "create_user_role", description: "Create User Roles" },
        { name: "get_company_user_list", description: "Get User List" },
        { name: "create_company_user", description: "Create User/Employee" },
        { name: "delete_company_user", description: "Delete user/employee" },
    ],
}