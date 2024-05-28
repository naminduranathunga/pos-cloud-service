
import User from "../schemas/company/user_schema";
import UserRole from "../schemas/company/user_permission_schema";
import { hash } from 'bcrypt'




export async function seed_users() {
    console.log("Seeding users...");
    const super_admin_role = await UserRole.findOne({name: "Super Admin"});

    if (!super_admin_role) {
        throw new Error("Super Admin role not found");
    }
    
    // Super admin
    const hashed_password = await hash("password", 10);
    const super_admin = new User({
        first_name: "Super",
        last_name: "Admin",
        email: "info@namisweb.lk",
        password: hashed_password,
        role: super_admin_role._id,
    });
    await super_admin.save();
}

