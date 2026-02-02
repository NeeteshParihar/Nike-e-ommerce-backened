import mongoose from "mongoose";

const productSchema = new mongoose.Schema({
    name: { type: String, required: true, trim: true },
    brand: { type: String, default: 'Nike' },
    base_price: { type: Number, required: true },
    currency: { type: String, default: 'INR' },
    slug: { type: String, required: true, unique: true },   
    description: { type: String, required: true },
    details: [String],
    category_ids: [{ type: mongoose.Schema.Types.ObjectId, ref: 'Category' }],
    color_styles: [{ 
        color_name: String,
        hex_code: String,
        gallery: [String],
        is_default: { type: Boolean, default: false }
    }],
    storytelling: [{
        block_type: { type: String, enum: ['video', 'image_text'] },
        url: String,
        headline: String,
        text: String
    }]
}, { timestamps: true });


const ProductModel = mongoose.models.Product ||  mongoose.model('Product', productSchema);
export default ProductModel;