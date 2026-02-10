import mongoose from "mongoose";

// SH-M-UK-10

const masterSizeSchema = new mongoose.Schema({
    // The unique key used in SKU (e.g., "SH-UK-10-M")
    sizeKey: { 
        type: String, 
        required: true, 
        unique: true, 
        uppercase: true 
    },
    // Category helps group sizes (Shoes, Apparel, Equipment)
    category: { 
        type: String, 
        enum: ['Shoes', 'Apparel', 'Accessories'], 
        required: true 
    },
    // Gender-specific sizing (Men, Women, Kids, Unisex) 
    standard: {
        type: String, 
        enum: ["IN", "UK", "EU", "US", "JP"],
        default: "UK"
    },
    gender: { 
        type: String, 
        LowerCase: true,
        enum: ['men', 'women', 'kids', 'unisex'],         
        required: true 
    },
    // The Primary Value shown to Indian customers
    primaryValue: { 
        type: String, 
        required: true 
    }, 
    // Measurement in CM or Inches (Used for "Find your Fit" logic)
    measurements: {
        value: { type: Number },
        unit: { type: String, enum: ['cm', 'in'], default: 'cm' }
    },
    // Conversion Matrix for International Display
    conversions: {
        us: { type: String },
        eu: { type: String },
        jp: { type: String }, // Often measured in CM
        uk: { type: String }
    },
    // Sort Order (Crucial for frontend lists: S, M, L, XL)
    sortOrder: { type: Number, default: 0 }
}, { timestamps: true });


// Index for fast lookup during bulk SKU creation
masterSizeSchema.index({ category: 1, gender: 1 });

const MasterSizeModel = mongoose.models.MasterSize || mongoose.model('MasterSize', masterSizeSchema);
export default MasterSizeModel;