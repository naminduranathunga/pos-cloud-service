import mongoose, { Schema } from "mongoose";


const ProductCategorySchema = new Schema({
    name: {
        type: String,
        required: true
    },
    company: {
        type: Schema.Types.ObjectId,
        ref: "Company",
        required: true
    },
    parent: {
        type: Schema.Types.ObjectId,
        ref: "ProductCategory",
        required: false
    }
});

const ProductCategory = mongoose.model('ProductCategory', ProductCategorySchema);

export default ProductCategory;