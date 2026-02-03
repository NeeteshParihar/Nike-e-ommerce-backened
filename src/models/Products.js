import mongoose from "mongoose";

// make the color_style schema 

const colorStyleSchema = new mongoose.Schema({
    colorName: { type: String, required: true },
    hexCode: { type: String, required: true },
    gallery: {
        type: [{
            imgUrl: { type: String, required: true },
            publicId: { type: String, required: true } // this will be used to delete the image later
        }],
        default: []
    },
    is_default: { type: Boolean, default: false }
});

// defined the story telling schema
const storytellingSchema = new mongoose.Schema({
    block_type: {
        type: String,
        enum: ['video', 'image_text'],
        required: true
    },
    url: { type: String },
    headline: { type: String },
    text: { type: String }
});

const productSchema = new mongoose.Schema({
    name: { type: String, required: true, trim: true },
    brand: { type: String, default: 'Nike' },
    base_price: { type: Number, required: true },
    currency: { type: String, default: 'INR' },
    slug: { type: String, required: true, unique: true },
    description: { type: String, required: true },
    details: [String],
    category_ids: {
        type: [{ type: mongoose.Schema.Types.ObjectId, ref: 'Category' }],
        default: []
    },
    color_styles: {
        type: [colorStyleSchema],
        default: []
    },
    storytelling: [storytellingSchema],
}, { timestamps: true });


const ProductModel = mongoose.models.Product || mongoose.model('Product', productSchema);
export default ProductModel;