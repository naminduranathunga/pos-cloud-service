import mongoose from "mongoose";

const ProductSchema = new mongoose.Schema({
    company: {
        type: mongoose.Schema.Types.ObjectId,
        ref: "Company",
        required: true
    },
    name: {
        type: String,
        required: true
    },
    sku: {
        type: String,
        required: true
    },
    thumbnail: {
        type: String,
        required: false,
        default: ""
    },
    inventory_type: {
        type: String,
        required: true,
        default: "nos",
    },
    prices: {
        type: Array<Number>,
        required: true,
    },
    size: {
        type: String,
        required: false,
        default: ""
    },
    weight: {
        type: Number,
        required: false,
        default: 0
    },
    barcodes: {
        type: Array<String>,
        required: false,
        default: []
    },
    is_active: {
        type: Boolean,
        required: false,
        default: true
    },
    category: {
        type: mongoose.Schema.Types.ObjectId,
        ref: "ProductCategory",
        required: false
    },
});

const Product = mongoose.model("Product", ProductSchema);
export default Product;