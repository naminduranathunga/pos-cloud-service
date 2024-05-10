import mongoose from "mongoose";


export default async function ConnectMongoDB(){
    const MongoDBURL = process.env.MONGODB_URL || "";
    if (!MongoDBURL) {
        throw new Error("MongoDB URL not found");
    }

    const res = await mongoose.connect(MongoDBURL);

    if (!res) {
        throw new Error("Failed to connect to MongoDB");
    }
}