import mongoose from "mongoose";
import ProductModel from "../../models/Products.js";
import ProductSKUModel from "../../models/ProductSku.js";

export const createFullProduct = async (req, res) => {

    const session = await mongoose.startSession();
    session.startTransaction();

    try {

        const { productData, skus } = req.body;

        // 1. Create the Product Master
        const product = await ProductModel.create([productData], { session });
        const productId = product[0]._id;

        // 2. Prepare SKUs by injecting the new Product ID
        const skusWithProductId = skus.map(sku => ({
            ...sku,
            product_id: productId
        }));

        // 3. Bulk Insert SKUs
        await ProductSKUModel.insertMany(skusWithProductId, { session });

        // Commit the changes
        await session.commitTransaction();
        session.endSession();

        res.status(201).json({ success: true, message: "Product and SKUs created successfully" });

    } catch (error) {
        // If anything fails, undo everything
        await session.abortTransaction();
        session.endSession();
        res.status(400).json({ success: false, error: error.message, errorIn: "controllers/admin/ProductController" });
    }
};

export const updateProductDetails = async( req, res) =>{
}

export const updateColorGallery = async(req, res)=>{
}


