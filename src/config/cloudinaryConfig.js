import multer from "multer";
import { v2 as cloudinary } from "cloudinary";
import { CloudinaryStorage } from "@fluidjs/multer-cloudinary";


// configure the cloudinary 

cloudinary.config({
    cloud_name: process.env.CLOUDINARY_CLOUD_NAME,
    api_key: process.env.CLOUDINARY_API_KEY,
    api_secret: process.env.CLOUDINARY_API_SECRET
})

// configure the storage engine which uses cloudinary storage

const storage = new CloudinaryStorage({
    cloudinary: cloudinary,
    params: async (req, file) => {
        // Logic outside the return object
        const originalName = file.originalname.split('.').slice(0, -1).join('.');
        const seoFriendlyName = originalName
            .toLowerCase()
            .replace(/\s+/g, '-')
            .replace(/[^a-z0-9-]/g, '');
        
        const finalId = `${seoFriendlyName}-${Date.now().toString().slice(-4)}`;
        const folderPath = `nike/products/${req.params.category || 'uncategorized'}`;

        // Return a plain object with strings
        return {
            folder: folderPath,
            public_id: finalId,
            allowed_formats: ['jpg', 'png', 'jpeg', 'webp', 'avif'],
            transformation: [{ width: 2000, quality: "auto", fetch_format: "auto" }]
        };
    },
});

export const upload = multer({ storage: storage });
