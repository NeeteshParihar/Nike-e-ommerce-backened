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
        const { categoryId, action, version } = req.body;

        // check the category
        const [isCategoryExist, isSubCategoryExist] = await Promise.all([
            CategoryModel.exists({ _id: categoryId }),
            CategoryModel.exists({ parent_category_id: categoryId })
        ]);

        if (isSubCategoryExist) {
            return res.status(400).json({
                success: false, message: "Invalid category heirarchy, its must be leaf category"
            })
        }

        if (!isCategoryExist) {
            return res.status(404).json({
                success: false, message: "Category not found"
            });
        }

        const query = { _id: productId };

        if (action.toLowerCase() === "remove") {
            // Rule: Only remove if there's more than 1 category
            query["categoryIds.1"] = { $exists: true };
        }

        const update = action === 'add'
            ? { $addToSet: { categoryIds: categoryId } }
            : { $pull: { categoryIds: categoryId } };

        const updatedProduct = await ProductModel.findOneAndUpdate(query, update, { new: true });


        if (!updatedProduct) {
            // If it fails, we check WHY
            const stillExists = await ProductModel.exists({ _id: productId });
            if (!stillExists) return res.status(404).json({ message: "Product was deleted by another admin" });

            return res.status(400).json({ message: "Action blocked by business rules (e.g., must have at least 1 category)" });
        }

        return res.status(200).json({ success: true, data: updatedProduct });

    } catch (err) {
        res.status(500).json({ success: false, error: err.message });
    }

};


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

        if(!productData) return res.status(404).json({
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
