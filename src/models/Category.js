import mongoose from "mongoose";


const filterSchema = new mongoose.Schema({
    key: {
        type: String,
        required: true
    },
    label: {
        type: String,
        required: true
    },/*  */
    uiType: {
        type: String,
        required: true,
        enum: ["grid", "range", "list", "checkbox", "radio", "dropdown"]
    },
    value: {
        type: [    
           String    // we can change this later if needed, the colors can be directly stored, min and maximum prices are stored as value[0] = minPrice, value[1] = maxPrice
        ],
        required: true
    }
})

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
    parentId: {
        type: mongoose.Schema.Types.ObjectId,
        ref: 'Category',
        default: null
    },
    level: { // the level of category like 0 for shoe, 1 for running, 2 for road running
        type: Number,
        default: 0
    },
    // note here filterSnapShots are not required so we can exclude them in non-leaf categories
    filterSnapShots: {
        colors: filterSchema,
        sizes: filterSchema,
        price: filterSchema,
        gender: filterSchema
    },

}, { timestamps: true });

const CategoryModel = mongoose.models.Category || mongoose.model('Category', categorySchema);
export default CategoryModel;
