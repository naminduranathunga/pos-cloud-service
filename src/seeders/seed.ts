import ConnectMongoDB from "../lib/connect_mongodb"
import { seed_user_roles } from "./seed_user_roles";
import { seed_users } from "./user_seed";
import { config } from 'dotenv';
config();

console.log("seeding database...")

async function seed() {
    await ConnectMongoDB();
    console.log("connected to MongoDB");

    // Add seed data here 
    await seed_user_roles();
    await seed_users();

    console.log("seeded successfully");
}

seed().then(() => {
    process.exit(0);
}).catch((err) => {
    console.error(err);
    process.exit(1);
})
