/**
 * Seed User Roles
 */

import UserRole from "../schemas/company/user_permission_schema";

export async function seed_user_roles() {
        
    // Super admin
    const super_admin = new UserRole({
        name: "Super Admin",
        slug: "super-admin",
        description: "Super Admin - For the system administration",
        permissions: ["super-admin-permissions"],
    });
    await super_admin.save();

    const admin = new UserRole({
        name: "Admin",
        slug: "company-admin",
        description: "Admin - For company administration",
        permissions: ["company-admin"],
        is_public: true,
    });
    await admin.save();
}