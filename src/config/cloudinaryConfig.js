import { v2 as cloudinary } from "cloudinary";
import { getImageUploader, getVideoUploader } from "../uitls/FileUploaders.js";
import { getImageStorage, getVideoStorage } from "../uitls/FileStorage.js";

cloudinary.config({
    cloud_name: process.env.CLOUDINARY_CLOUD_NAME,
    api_key: process.env.CLOUDINARY_API_KEY,
    api_secret: process.env.CLOUDINARY_API_SECRET,
});

// make the storage for images
const imageStorage = getImageStorage();
// make the uploader for the images
export const imageUploader = getImageUploader(imageStorage);

// make the storage for the vidoes
const videoStorage = getVideoStorage();
// make the uploader for video
export const videoUploader = getVideoUploader(videoStorage);

