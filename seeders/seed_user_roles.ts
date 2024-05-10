/**
 * Seed User Roles
 */

import UserRole from "../src/schemas/company/user_permission_schema";

export async function seed_user_roles() {
        
    // Super admin
    const super_admin = new UserRole({
        name: "Super Admin",
        slug: "super-admin",
        description: "Super Admin - For the system administration",
        permissions: ["all"],
    });
    await super_admin.save();

    const admin = new UserRole({
        name: "Admin",
        slug: "company-admin",
        description: "Admin - For company administration",
        permissions: ["all-company"],
    });
    await admin.save();
}