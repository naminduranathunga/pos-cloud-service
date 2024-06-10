/**
 * Configuration File for Company Manager Module
 */

export default {
    name: 'company_manager',
    description: 'This Module Manages the profile of the Company',
    permissions: [
        { name: "create_a_branch", description: "Create a branch/wearhouse" },
        { name: "remove_a_branch", description: "Remove a branch/wearhouse" },
    ],
}