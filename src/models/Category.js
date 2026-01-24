import mongoose from "mongoose";


const filterSchema = new mongoose.Schema({
    key: { type: String, required: true },
    label: { type: String, required: true },
    ui_type: { 
        type: String, 
        enum: ['button_grid', 'color_swatch', 'checkbox', 'range_slider', 'price_buckets'],
        default: 'checkbox'
    },
    options: [{
        // 'label' is what the user sees (e.g., "Under ₹2,500" or "UK 10")
        label: { type: String, required: true },
        // 'value' is for simple filters (e.g., "10", "red")
        value: { type: String }, 
        // 'min' and 'max' are for range filters
        min: { type: Number },
        max: { type: Number }
    }]
});

const categorySchema = new mongoose.Schema({
    name: {
        type: String,
        required: true
    },
    description: {
        type: String,
        required: true
    },
    slug: {  // the user-friendly, readable part of a URL that identifies a specific product page
        type: String,
        required: true, 
        unique: true 
    },
    parent_category_id: {
        type: mongoose.Schema.Types.ObjectId,
        ref: 'Category',
        default: null
    },    
    level: { // the level of category like 0 for shoe, 1 for running, 2 for road running
        type: Number,
        default: 0
    },
    filters: [filterSchema], //the filters of this category

}, { timestamps: true });

const CategoryModel =  mongoose.models.Category || mongoose.model('Category', categorySchema);
export default CategoryModel;