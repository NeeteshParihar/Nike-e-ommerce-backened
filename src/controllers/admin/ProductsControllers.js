import mongoose from "mongoose";
import ProductModel from "../../models/Products.js";
import ProductSKUModel from "../../models/ProductSku.js";
import { imageUploader } from "../../config/cloudinaryConfig.js";
import { generateSlug } from "../../uitls/slugGenerator.js"


export const createProduct = async (req, res) => {
    try {

        // make sure our data validation layer validate and sanitize this data
        const { name, brand, basePrice, description, details, categoryIds, colorStyles, storytelling } = req.body;

        const slug = generateSlug(name);

        const newProduct = await ProductModel.create({
            name, brand, basePrice,  slug, description, details, categoryIds, colorStyles, storytelling
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

//  here product details those are updatable are : baseprice, desc, details
export const updateProductDetails = async (req, res) => {

    try{

        // <--- make sure to pass this data through data validation and sanitization layer before saving ----->

        const productId = req.params.id;
        const { basePrice, description, details } = req.body;

        const updatedProduct = await ProductModel.findByIdAndUpdate(
            productId,
            { basePrice, description, details },
            { new: true }
        );

        res.status(200).json({
            success: true,
            message: "Product details updated successfully",
            data: updatedProduct
        });

    }catch(err){
        
        return res.status(500).json({
            success: false,
            error: err.message,
            errorIn: "controllers/admin/ProductsControllers/updateProductDetails"
        });
    }
}


export const addColorToGallery = async (req, res) => {


    try {

        const colorName = req.colorName;
        const colorCode = req.colorCode;
        const productId = req.params.id;

        if (!colorName || !colorCode) return res.json({
            success: false, message: "Please send the color group and color code in the headers"
        });

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

            // add the files to the colorName in the product 


            const newColorStyle = {
                colorName: colorName,
                hexCode: colorCode,
                gallery: filePaths, // The array of URLs from Cloudinary
                isDefault: req.isDefault || false
            };

            //  to make this color as default we have to mark others as defaut: false
            if (req.isDefault) {
                await ProductModel.updateOne(
                    { _id: productId },
                    { $set: { "color_styles.$[].is_default": false } } // Set ALL array items to false
                );
            }
            //  after that we can upload the value 

            const updatedProduct = await ProductModel.findByIdAndUpdate(
                productId,
                { $push: { colorStyles: newColorStyle } },
                { new: true } // Returns the modified document rather than the original
            );

            res.status(201).json({
                success: true,
                updatedProduct
            });
        })


    } catch (err) {
        res.json({ success: false, error: err.message });
    }
}
