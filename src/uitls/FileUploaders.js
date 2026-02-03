// Define common limits
import multer from "multer";


const IMG_LIMIT = 5 * 1024 * 1024;   // 5MB
const VID_LIMIT = 50 * 1024 * 1024;  // 50MB

// 1. Image Uploader

const imageFileFilter = (req, file, cb) => {

    if (file.originalname.length > 100) {
        throw new Error('Filename exceeds 100 characters');
    }

    if (!file.mimetype.startsWith('image/')) {
        return cb(new Error('Only images are allowed in this field!'), false);
    }
   cb(null, true); // Calls your existing name length check
}


const videoFileFilter = (req, file, cb) => {

    if (file.originalname.length > 100) {
        throw new Error('Filename exceeds 100 characters');
    }

    if (!file.mimetype.startsWith('video/')) {
        return cb(new Error('Only videos are allowed in this field!'), false);
    }
    cb(null, true);
}


export const getImageUploader = (storage) => {
    return multer({
        storage: storage,
        fileFilter: imageFileFilter,
        limits: { fileSize: IMG_LIMIT },
    });

}
// 2. Video Uploader

export const getVideoUploader = (storage) => {

    return multer({
        storage: storage,
        fileFilter: videoFileFilter,
        limits: { fileSize: VID_LIMIT },
    });
}
