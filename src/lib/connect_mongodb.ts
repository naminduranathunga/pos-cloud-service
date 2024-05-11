import mongoose from "mongoose";
/**
 * Connect to MongoDB
 */

export default async function ConnectMongoDB(){
    const host = process.env.MONGODB_HOST || "localhost";
    const user = process.env.MONGODB_USER || "";
    const pass = process.env.MONGODB_PASSWORD || "";
    const db = process.env.MONGODB_DB_NAME || "test";
    const MongoDBURL = `mongodb+srv://${user}:${pass}@${host}/${db}`;
    if (!MongoDBURL) {
        throw new Error("MongoDB URL not found");
    }

    const res = await mongoose.connect(MongoDBURL);

    if (!res) {
        throw new Error("Failed to connect to MongoDB");
    }
}