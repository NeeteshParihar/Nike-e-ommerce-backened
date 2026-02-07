import mongoose from 'mongoose';

const productSKUSchema = new mongoose.Schema({
    productId: { type: mongoose.Schema.Types.ObjectId, ref: 'Product', required: true },
    skuCode: { type: String, required: true, unique: true },
    size: { type: String, required: true },
    color: { type: String, required: true },
    price: { type: Number, required: true },
    mrp: {type: Number, required: true},  // validate at controller level that mrp should be never smaller than the price
    stock: { type: Number, default: 0 }, // stock can never be negative
    taxInfo: {
        isInclusive: { type: Boolean, default: true },
        percentage: { type: Number, default: 18 }
    },
    countryOfOrigin: { type: String, default: 'India' }
}, { timestamps: true });

const ProductSKU = mongoose.models.ProductSKU ||  mongoose.model('ProductSKU', productSKUSchema);
export default ProductSKU;
