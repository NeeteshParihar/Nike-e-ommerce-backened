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
        const { basePrice, description, details, status } = req.body;
        const version = Number.parseInt(req.body?.version);

        if (Number.isNaN(version)) return res.status(400).json({
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
        const { categoryId, action } = req.body; // action: 'add' | 'remove'
        const version = Number.parseInt(req.body?.version);

        if (Number.isNaN(version)) {
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
        const version = Number.parseInt(req.body?.version);

        if (Number.isNaN(version)) return res.status(400).json({
            success: false,
            message: "Deletion requires a version number for concurrency control"
        });

        const deletedProduct = await ProductModel.findOneAndUpdate(
            { _id: productId, __v: version },
            {
                $set: { status: 'deleted' },
                $inc: { __v: 1 }
            },
            { new: true }
        );

        if (!deletedProduct) return res.status(409).json({
            success: false,
            message: "Conflict: Product version mismatch or product not found"
        });

        return res.status(200).json({
            success: true,
            data: deletedProduct
        });

    } catch (err) {

        return res.status(500).json({
            success: false,
            error: err.message
        });
    }
}

// <---------- here comes the controller for the Removing the color and its images ------->
export const removeColorStyle = async (req, res) => {
    try {

        const productId = req.params.id;        
        const colorId = req.params.colorId;
        const version = Number.parseInt(req.body?.version);
        const colorName = req.body.colorName;
       

        if (Number.isNaN(version) || !colorName ) return res.status(400).json({
            success: false,
            message: "Invalid request"
        });

        const [product, productSku] = await Promise.all([
            ProductModel.findOne({ _id: productId, "colorStyles._id": colorId, __v: version }),
            ProductSKUModel.exists({ product_id: productId, color: colorName }) 
        ]);
        if (!product) return res.status(404).json({ success: false, message: "Product or Color Style not found, please refresh the page and try again" });
        if(  productSku ) return res.status(200).json( { success: false, message: "Product SKU found with the following color Style" })

        const colorStyle = product.colorStyles.find(style => style._id.toString() === colorId);
        const publicIds = colorStyle.gallery.map(img => img.publicId);

        if(colorStyle.is_default) return res.status(400).json({ success: false, message: "Default color cannot be removed, Please change default first"});

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
        console.log(err);
        res.status(500).json({ success: false, error: err.message });
    }
};
// <---------------- here comes the logic to to add the images to a color color ------------>
export const addImagesToExistingColor = async (req, res) => {

    try {

        imageUploader.array("gallery", 10)(req, res, async (err) => {

            if (err) return res.status(500).json({ success: false, error: err.message });

            if (!req.files?.length) return res.status(400).json({ success: false, message: "No files were uploaded" });

            const productId = req.params.id;
            const colorId = req.params.colorId;

            const version = Number.parseInt(req.body?.version);

            if (Number.isNaN(version)) return res.status(400).json({
                success: false,
                message: "Updates are not possible without version number"
            });

            const filePaths = req.files.map(file => ({ imgUrl: file.path, publicId: file.filename }));


            try {


                const updatedProduct = await ProductModel.findOneAndUpdate(
                    {
                        _id: productId,
                        __v: version,
                        "colorStyles._id": colorId
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

    } catch (err) {
        console.log(err);
        res.status(500).json({
            succes: false, message: err.message
        });
    }
};

// <--------------- here comes the logic to remove the images from the color --------------->
export const removeImageFromColor = async (req, res) => {



    try {

        const productId = req.params.id;
        const colorId = req.params.colorId;
        const version = Number.parseInt(req.body?.version);

        const { publicIdList } = req.body; // publicIdList: ["id1", "id2"]



        if (!publicIdList || !Array.isArray(publicIdList) || publicIdList.length === 0) return res.status(400).json({
            success: false,
            message: "List of  PulbicId are required"
        });

        if (Number.isNaN(version)) return res.status(400).json({
            success: false,
            message: "Updates are not possible without version number",
            version,
            productId,
            colorId
        });
        // 2. Update DB 

        const updatedProduct = await ProductModel.findOneAndUpdate(
            {
                _id: productId,
                __v: version,
                "colorStyles._id": colorId
            },
            {
                $pull: { "colorStyles.$.gallery": { publicId: { $in: publicIdList } } },
                $inc: { __v: 1 }
            },
            { new: true }
        );

        if (!updatedProduct) {
            return res.status(409).json({ success: false, message: "Version mismatch or color not found, please refresh the page and try again", version, productId, colorId });
        }

        // 3. Delete multiple from Cloudinary
        await Promise.all(publicIdList.map(pid => cloudinary.uploader.destroy(pid)));

        res.status(200).json({
            success: true,
            message: "Images removed successfully",
            data: updatedProduct
        });

    } catch (err) {

        res.status(500).json({ success: false, error: err.message });
    }
};