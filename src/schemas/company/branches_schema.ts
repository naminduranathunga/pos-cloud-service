import mongoose, { Schema } from "mongoose";

const BranchSchema = new Schema({
    company: {
        type: Schema.Types.ObjectId,
        ref: "Company",
        required: true
    },
    name: {
        type: String,
        required: true
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
    email: {
        type: String,
        required: false,
        default: ""
    },
    metadata: {
        type: Object,
        required: false,
        default: {}
    }
})

const Branch = mongoose.model('Branch', BranchSchema);

export default Branch;