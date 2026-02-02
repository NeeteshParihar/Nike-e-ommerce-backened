import mongoose from "mongoose";
import ProductModel from "../../models/Products.js";
import ProductSKUModel from "../../models/ProductSku.js";
import { upload } from "../../config/cloudinaryConfig.js";


export const createProduct = async (req, res) => {
    try {

        // make sure our data validation layer validate and sanitize this data
        const {name, brand, base_price, currency, slug, description, details, category_ids, color_styles, storytelling} = req.body ;

        const newProduct = await ProductModel.create({
           name, brand, base_price, currency, slug, description, details, category_ids, color_styles, storytelling 
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


export const updateProductDetails = async (req, res) =>{
    
}


export const updateColorGallery = async (req, res) => {


    try {


        const colorName = req.color_name;
        const colorCode = req.color_code;
        const productId = req.params.id;


        if (!colorName || !colorCode) return res.json({
            success: false, message: "Please send the color group and color code in the headers"
        })

        upload.array("gallery", 10)(req, res, async (err) => {


            if (err) {
                return res.status(500).json({ success: false, error: err.message });
            }

            if (!req.files.length) return res.status(400).json({
                success: false, error: "No files were uploaded"
            })

            const filePaths = req.files.map(file => file.path);

            // add the files to the colorName in the product 

            const newColorStyle = {
                color_name: colorName,
                hex_code: colorCode,
                gallery: filePaths, // The array of URLs from Cloudinary
                is_default: req.is_default || false
            };

            //  to make this color as default we have to mark others as defaut: false
            if (req.is_default) {
                await ProductModel.updateOne(
                    { _id: productId },
                    { $set: { "color_styles.$[].is_default": false } } // Set ALL array items to false
                );
            }
            //  after that we can upload the value 

            const updatedProduct = await ProductModel.findByIdAndUpdate(
                productId,
                { $push: { color_styles: newColorStyle } },
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
