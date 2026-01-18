import { Schema, model } from "mongoose";

const categorySchema = new Schema({
    name: {
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
    filter_group_id: {
        type: mongoose.Schema.Types.ObjectId,
        ref: 'FilterGroup'
    },
    level: { // the level of category like 0 for shoe, 1 for running, 2 for road running
        type: Number,
        default: 0
    }
}, { timestamps: true });

const CategoryModel = model('Category', categorySchema);
export default CategoryModel;