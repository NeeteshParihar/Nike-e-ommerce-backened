import { Schema, model } from "mongoose";

const productSKUSchema = new Schema({
    product_id: {
        type: mongoose.Schema.Types.ObjectId,
        ref: 'Product',
        required: true
    },
    sku_code: {
        type: String,
        required: true,
        unique: true
    },
    size: {
        type: String,
        required: true
    },
    color: {
        type: String,
        required: true
    },
    price: {
        type: Number,
        required: true
    },
    stock: {
        type: Number,
        default: 0
    },
    tax_info: {
        is_inclusive: {
            type: Boolean,
            default: true
        },
        percentage: {
            type: Number,
            default: 18
        }
    },
    country_of_origin: String,
    is_active: { type: Boolean, default: true }
}, { timestamps: true });

const ProductSKUModel = model('ProductSKU', productSKUSchema);
export default ProductSKUModel;