import mongoose from "mongoose";

const masterColorSchema = new mongoose.Schema({
    name: {  // this will store the exact color name
        type: String, 
        required: true, 
        unique: true, 
        lowercase: true, 
        trim: true 
    },
    hexCode: {   // this will store the hex color code
        type: String, 
        required: true, 
        uppercase: true,
        match: [/^#([A-Fa-f0-9]{6}|[A-Fa-f0-9]{3})$/, 'Please provide a valid hex color code']
    },
    group: { // this will store the color group like for university red this is will store the red, so user can easily type red and we can give the all red grouped values
        type: String,
        enum: ['Red', 'Blue', 'Green', 'Black', 'White', 'Grey', 'Multi', 'Other'],
        required: true 
    }
}, { timestamps: true });


const MasterColorModel = mongoose.models.MasterColor || mongoose.model('MasterColor', masterColorSchema);
export default MasterColorModel;