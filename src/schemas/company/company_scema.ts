import mongoose, { Schema } from "mongoose";


const CompanySchema = new Schema({
    name: {
        type: String,
        required: true
    },
    brn: {
        type: String,
        required: true
    },
    email: {
        type: String,
        required: true,
        unique: true
    },
    address: {
        type: String,
        required: true
    },
    phone: {
        type: Array<String>,
        required: false,
        default: []
    },
    modules: {
        type: Array<String>,
        required: false,
        default: []
    },
    branches: {
        type: Array<Schema.Types.ObjectId>,
        required: false,
        default: []
    },
    isActive: {
        type: Boolean,
        required: false,
        default: true
    }
});

const Company = mongoose.model('Company', CompanySchema);

export default Company;