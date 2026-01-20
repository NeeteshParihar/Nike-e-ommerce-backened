import mongoose from 'mongoose';

const productSKUSchema = new mongoose.Schema({
    product_id: { type: mongoose.Schema.Types.ObjectId, ref: 'Product', required: true },
    sku_code: { type: String, required: true, unique: true },
    size: { type: String, required: true },
    color: { type: String, required: true },
    price: { type: Number, required: true },
    stock: { type: Number, default: 0 },
    tax_info: {
        is_inclusive: { type: Boolean, default: true },
        percentage: { type: Number, default: 18 }
    },
    country_of_origin: { type: String, default: 'India' }
}, { timestamps: true });

const ProductSKU = mongoose.models.ProductSKU ||  mongoose.model('ProductSKU', productSKUSchema);
export default ProductSKU;