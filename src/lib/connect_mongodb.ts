import mongoose from "mongoose";
/**
 * Connect to MongoDB
 */

export default async function ConnectMongoDB(){
    const host = process.env.MONGODB_HOST || "localhost";
    const user = process.env.MONGODB_USER || "";
    const pass = process.env.MONGODB_PASSWORD || "";
    const db = process.env.MONGODB_DB_NAME || "test";
    const protocol = process.env.MONGODB_PROTOCOL || "mongodb+srv";
    const params = process.env.MONGODB_URL_PARAMETERS || "";

    const MongoDBURL = `${protocol}://${user}:${pass}@${host}/${db}${params}`;
    if (!MongoDBURL) {
        throw new Error("MongoDB URL not found: " + MongoDBURL);
    }

    const res = await mongoose.connect(MongoDBURL);

    if (!res) {
        throw new Error("Failed to connect to MongoDB");
    }
}