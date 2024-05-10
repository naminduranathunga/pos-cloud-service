import { Schema, model } from "mongoose";


const UserRolesSchema = new Schema({
    name: {
        type: String,
        required: true,
    },
    slug: {
        type: String,
        required: true,
    },
    description: {
        type: String,
        required: false,
    },
    permissions: {
        type: [String],
        required: true,
    },
    company: {
        type: Schema.Types.ObjectId,
        ref: "Company",
        required: false,
    },
});

const UserRole = model("UserRole", UserRolesSchema);

export default UserRole;