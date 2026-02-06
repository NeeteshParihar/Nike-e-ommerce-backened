import mongoose from "mongoose";
import CategoryModel from "../../models/Category.js";
import { v2 as cloudinary } from "cloudinary";

// import the controllers
import ProductModel from "../../models/Products.js";
import ProductSKUModel from "../../models/ProductSku.js";
import { imageUploader } from "../../config/cloudinaryConfig.js";
import { generateSlug } from "../../uitls/slugGenerator.js"

// import the querBuilders 
import { queryForUpdatingBasicDetails, getProductParamsForCategoryUpdate } from "../../uitls/ProductQueryBuilders.js";


export const createProduct = async (req, res) => {
    try {

        // make sure our data validation layer validate and sanitize this data
        const { name, brand, basePrice, description, details, categoryIds, colorStyles, storytelling } = req.body;

        const slug = generateSlug(name);

        const newProduct = await ProductModel.create({
            name, brand, basePrice, slug, description, details, categoryIds, colorStyles, storytelling
        })

        return res.status(201).json({
            success: true,
            data: newProduct
        });

    } catch (err) {
        res.status(400).json({
            success: false,
            error: err.message,
            errorIn: "controllers/admin/ProductsControllers/createProduct"
        });
    }
};

//  here product details those are updatable are : baseprice, desc, details, status
export const updateProductDetails = async (req, res) => {

    try {


        // <--- make sure to pass this data through data validation and sanitization layer before saving ----->

        const productId = req.params.id;
        const { basePrice, description, details, version, status } = req.body;

        if (!Number.isInteger(version)) return res.status(400).json({
            success: false,
            message: "Updates are not possible without version number"
        });


        // getting only fields those are send
        const updateParams = queryForUpdatingBasicDetails({ basePrice, description, details, status });
        // { basePrice: price, ...}

        const updatedProduct = await ProductModel.findOneAndUpdate(
            {
                _id: productId,
                __v: version
            },
            {
                ...updateParams,
                $inc: { __v: 1 }  // manually increment the version
            },
            {
                new: true
            }
        )

        if (!updatedProduct) return res.status(404).json({
            success: false,
            message: "Product not found or version mismatched Please refresh the page and try again"
        });


        res.status(200).json({
            success: true,
            message: "Product details updated successfully",
            data: {
                updatedProduct,
                version: updatedProduct.__v
            }
        });

    } catch (err) {

        return res.status(500).json({
            success: false,
            error: err.message,
            errorIn: "controllers/admin/ProductsControllers/updateProductDetails"
        });
    }
}

export const addColorToGallery = async (req, res) => {

    imageUploader.array("gallery", 10)(req, res, async (err) => {

        if (err) {
            return res.status(500).json({ success: false, error: err.message });
        }

        if (!req.files.length) return res.status(400).json({
            success: false, error: "No files were uploaded"
        });


        const filePaths = req.files.map(file => ({
            imgUrl: file.path,
            publicId: file.filename
        }));

        try {

            const query = {
                _id: req.params.id,
                __v: req.version
            };

            const update = {
                $push: {
                    colorStyles: {
                        colorName: req.colorName,
                        hexCode: req.colorCode,
                        gallery: filePaths,
                    }
                },
                $inc: { __v: 1 } // Bump the version
            };


            const updatedProduct = await ProductModel.findOneAndUpdate(query, update, { new: true });

            // 3. THE ROLLBACK: If version mismatch occurred during upload
            if (!updatedProduct) {
                // Delete newly uploaded images from Cloudinary to keep storage clean
                const deletePromises = filePaths.map(img => cloudinary.uploader.destroy(img.publicId));
                await Promise.all(deletePromises);

                return res.status(409).json({
                    success: false,
                    message: "Conflict: Product version changed or product not found while uploading. Images cleared. Please refresh the page and try again."
                });

            }

            return res.status(201).json({
                success: false,
                message: "Images uploaded successfully",
                data: updatedProduct
            });

        } catch (err) {

            // Safety Rollback for any unexpected Database crash
            const deletePromises = filePaths.map(img => cloudinary.uploader.destroy(img.publicId));
            await Promise.all(deletePromises);
            res.status(500).json({ success: false, error: "Database error occurred. Uploaded images rolled back." });
        }


    });

}


export const updateProductCategories = async (req, res) => {
    try {
        const productId = req.params.id;
        const { categoryId, action, version } = req.body; // action: 'add' | 'remove'

        if (version === undefined || Number.isInteger(version) === false) {
            return res.status(400).json({ success: false, message: "Version is required and must be an integer" });
        }

        let updateQuery = {};

        if (action === 'add') {

            const [isCategoryExists, isSubCategoryExist] = await Promise.all([
                CategoryModel.exists({ _id: categoryId }),
                CategoryModel.exists({ parent_category_id: categoryId })
            ]);

            if (!isCategoryExists || isSubCategoryExist) return res.status(400).json({ success: false, message: "Invalid category, No changes done", categoryId });

            updateQuery = { $addToSet: { categoryIds: categoryId } };

        } else if (action === 'remove') {
            updateQuery = { $pull: { categoryIds: categoryId } };
        } else {
            return res.status(400).json({ success: false, message: "Invalid action" });
        }

        const updatedProduct = await ProductModel.findOneAndUpdate(
            { _id: productId, __v: version },
            {
                ...updateQuery,
                $inc: { __v: 1 }
            },
            { new: true }
        ).select("-colorStyles -storytelling");

        if (!updatedProduct) {
            return res.status(409).json({
                success: false,
                message: "Conflict: Product version mismatch or product not found, try again"
            });
        }

        res.status(200).json({ success: true, data: updatedProduct });

    } catch (err) {
        res.status(500).json({
            success: false,
            error: err.message,
            errorIn: "controllers/admin/ProductsControllers/updateProductCategories"
        });
    }
}


export const deleteProduct = async (req, res) => {

    try {

        const productId = req.params.id;

        const [productData] = await ProductModel.aggregate([
            { $match: { _id: new mongoose.Types.ObjectId(productId) } },
            {
                $project: {
                    publicIds: {
                        $reduce: {
                            input: "$colorStyles",
                            initialValue: [],
                            in: { $concatArrays: ["$$value", "$$this.gallery.publicId"] }
                        }
                    }
                }
            }
        ]);

        if (!productData) return res.status(404).json({
            success: false, message: "Product not found"
        });

        // delete the images
        const deletePromises = productData.publicIds.map(img => cloudinary.uploader.destroy(img));
        await Promise.all(deletePromises);

        // delete the sku's

        // delete the products 
        const deletedProduct = await ProductModel.deleteOne({ _id: productId });

        // 
        return res.status(200).json({
            success: true,
            data: deletedProduct
        });

    } catch (err) {

        return res.status(500).json({
            success: true,
            data: err.message
        });
    }
}


// <---------- here comes the controller for the Removing the color and its images ------->
export const removeColorStyle = async (req, res) => {
    try {
        const productId = req.params.id;
        const colorId = req.params.colorId;
        const { version } = req.body; // colorId is the id of that color in the gallery of product that we want to delete

        if (version === undefined || Number.isInteger(version) === false) {
            return res.status(400).json({ success: false, message: "Version is required and must be an integer" });
        }

        
        const product = await ProductModel.findOne({ _id: productId, "colorStyles._id": colorId });
        if (!product) return res.status(404).json({ success: false, message: "Product or Color Style not found" });

        const colorStyle = product.colorStyles.find(style => style._id.toString() === colorId );
        const publicIds = colorStyle.gallery.map(img => img.publicId);

        const updatedProduct = await ProductModel.findOneAndUpdate(
            { _id: productId, __v: version },
            {
                $pull: { colorStyles: { _id: colorId } },
                $inc: { __v: 1 }
            },
            { new: true }
        );

        if (!updatedProduct) return res.status(409).json({ success: false, message: "Version Conflict, please refresh the page and try again" });

        // Cleanup Cloudinary
        if (publicIds.length > 0) {
            await Promise.all(publicIds.map(pid => cloudinary.uploader.destroy(pid)));
        }

        res.status(200).json({ success: true, data: updatedProduct });
        
    } catch (err) {
        res.status(500).json({ success: false, error: err.message });
    }
};

// <---------------- here comes the logic to to add the images to a color color ------------>
export const addImagesToExistingColor = async (req, res) => {
    imageUploader.array("gallery", 10)(req, res, async (err) => {
        if (err) return res.status(500).json({ success: false, error: err.message });

        const { colorName, version } = req.body;
        const filePaths = req.files.map(file => ({ imgUrl: file.path, publicId: file.filename }));

        try {
            const updatedProduct = await ProductModel.findOneAndUpdate(
                {
                    _id: req.params.id,
                    __v: version,
                    "colorStyles.colorName": colorName
                },
                {
                    $push: { "colorStyles.$.gallery": { $each: filePaths } },
                    $inc: { __v: 1 }
                },
                { new: true }
            );

            if (!updatedProduct) {
                await Promise.all(filePaths.map(img => cloudinary.uploader.destroy(img.publicId)));
                return res.status(409).json({ success: false, message: "Conflict: Version mismatch or color not found" });
            }

            res.status(200).json({ success: true, data: updatedProduct });
        } catch (error) {
            await Promise.all(filePaths.map(img => cloudinary.uploader.destroy(img.publicId)));
            res.status(500).json({ success: false, error: error.message });
        }
    });
};

// <--------------- here comes the logic to remove the images from the color --------------->
export const removeImageFromColor = async (req, res) => {
    try {
        const { id } = req.params;
        const { colorName, publicId, version } = req.body;

        if (version === undefined) return res.status(400).json({ success: false, message: "Version is required" });

        // 1. Find the image details first to ensure it exists in this specific color group
        const product = await ProductModel.findOne({
            _id: id,
            "colorStyles.colorName": colorName,
            "colorStyles.gallery.publicId": publicId
        });

        if (!product) {
            return res.status(404).json({ success: false, message: "Image not found in specified color style" });
        }

        // 2. Update DB
        const updatedProduct = await ProductModel.findOneAndUpdate(
            {
                _id: id,
                __v: version,
                "colorStyles.colorName": colorName
            },
            {
                $pull: { "colorStyles.$.gallery": { publicId: publicId } },
                $inc: { __v: 1 }
            },
            { new: true }
        );

        if (!updatedProduct) {
            return res.status(409).json({ success: false, message: "Version mismatch" });
        }

        // 3. Delete from Cloudinary
        await cloudinary.uploader.destroy(publicId);

        res.status(200).json({
            success: true,
            message: "Image removed successfully",
            data: updatedProduct
        });

    } catch (err) {
        res.status(500).json({ success: false, error: err.message });
    }
};