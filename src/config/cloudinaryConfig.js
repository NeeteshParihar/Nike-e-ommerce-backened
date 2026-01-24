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
        // 1. Get the original name and strip the extension (e.g., "Air Max Side.jpg" -> "Air Max Side")
        const originalName = file.originalname.split('.').slice(0, -1).join('.');

        // 2. Clean it up: lowercase and replace spaces/specials with hyphens
        const seoFriendlyName = originalName
            .toLowerCase()
            .replace(/\s+/g, '-')           // Spaces to hyphens
            .replace(/[^a-z0-9-]/g, '');    // Remove non-alphanumeric except hyphens

        // 3. Optional: Add a short timestamp to prevent overwriting if two admins upload "front.jpg"
        const finalId = `${seoFriendlyName}-${Date.now().toString().slice(-4)}`;

        return {
            folder: `nike/products/${req.params.category || 'uncategorized'}`,
            public_id: finalId,
            allowed_formats: ['jpg', 'png', 'jpeg', 'webp'],
            transformation: [
                { width: 2000, quality: "auto", fetch_format: "auto" },
                // Optimize but keep high-res
                { strip_metadata: true } // Remove GPS/camera data for privacy/size
            ]
        };
    },
});


export const upload = multer({ storage: storage });
