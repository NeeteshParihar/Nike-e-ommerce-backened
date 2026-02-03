import { v2 as cloudinary } from "cloudinary";
import { CloudinaryStorage } from "multer-storage-cloudinary";

export const getImageStorage = () => {

    return new CloudinaryStorage({
        cloudinary: cloudinary,
        params: {
            folder: (req, file) => {
                const category = req.category;
                const folderName = `Products/images/${category || "default"}`;
                return folderName;
            },
            public_id: (req, file) => {

                const fileNameWithoutExt = file.originalname.split('.').slice(0, -1).join('.');
                const seoFriendlyName = fileNameWithoutExt
                    .toLowerCase()
                    .replace(/[^a-z0-9]/g, '-') // Replace non-alphanumeric with hyphens
                    .replace(/-+/g, '-');       // Remove double hyphens

                return `${seoFriendlyName}-${Date.now()}`;
            },
            resource_type: 'auto'
        },
    });
} 


export const getVideoStorage =  () => {

    return new CloudinaryStorage({
        cloudinary: cloudinary,
        params: {
            folder: (req, file) => {
                const category = req.category;
                const folderName = `Products/vidoes/${category || "default"}`;
                return folderName;
            },
            public_id: (req, file) => {

                const fileNameWithoutExt = file.originalname.split('.').slice(0, -1).join('.');
                const seoFriendlyName = fileNameWithoutExt
                    .toLowerCase()
                    .replace(/[^a-z0-9]/g, '-') // Replace non-alphanumeric with hyphens
                    .replace(/-+/g, '-');       // Remove double hyphens

                return `${seoFriendlyName}-${Date.now()}`;
            },
            resource_type: 'auto'
        },
    });
}