import mongoose from 'mongoose';

const sizeSchema = new mongoose.Schema({
    sizeKey: { type: String, required: true },
    primaryValue: { type: String, required: true },
    standard: { type: String, enum: ["IN", "UK", "EU", "US", "JP"], default: "UK" },
})


const colorSchema = new mongoose.Schema({
   name: { type: String, required: true },
   hexCode: { type: String, required: true, uppercase: true },
   group: { type: String, required: true }
})

const productSKUSchema = new mongoose.Schema({
    productId: { type: mongoose.Schema.Types.ObjectId, ref: 'Product', required: true },
    skuCode: { type: String, required: true, unique: true, index: true },
    size: { type: sizeSchema, required: true, _id: false },
    colors: {
        type: [colorSchema],
        required: true,
        _id: false,      
    },
    displayColors: {
        type: String,
        required: true,
        index: true
    },
    price: { type: Number, required: true },
    mrp: { type: Number, required: true },  // validate at controller level that mrp should be never smaller than the price
    stock: { type: Number, default: 0 }, // stock can never be negative
    taxInfo: {
        isInclusive: { type: Boolean, default: true },
        percentage: { type: Number, default: 18 }
    },
    countryOfOrigin: { type: String, default: 'India' }
}, { timestamps: true });

// Add this to your ProductSKU Schema
productSKUSchema.index({ productId: 1, displayColors: 1, "size.sizeKey": 1 }, { unique: true });

// validate the colors
productSKUSchema.path("colors").validate( colors=>colors.length <= 5 , "colors should be atmost of size 5");

const ProductSKU = mongoose.models.ProductSKU || mongoose.model('ProductSKU', productSKUSchema);
export default ProductSKU;













