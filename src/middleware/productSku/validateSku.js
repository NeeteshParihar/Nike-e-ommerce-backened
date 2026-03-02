import ProductModel from "../../models/Products.js";
import MasterSizeModel from "../../models/Size.js";
import MasterColorModel from "../../models/color.js";


/**
 * Middleware to validate SKU data before creation
 * It prepares:
 * - req.productDetails: Basic info needed for SKU code generation
 * - req.eligibleSkus: Validated SKU objects
 * - req.nonEligibleSkus: SKUs that failed validation
 */

export const validateSkusMiddleware = async (req, res, next) => {

    try {

        const { productId, skus } = req.body;

        if (!skus || !Array.isArray(skus) || skus.length === 0 || !productId) return res.status(400).json({
            success: false,
            message: "Invalid request"
        })

        const product = await ProductModel.findById(productId).select("name gender brand colorStyles.colorName");
        if (!product) return res.status(404).json({
            success: false,
            message: "Product not found"
        });

        // extract the unique colors and sizeKeys from the productCku
        const skusSizeKeys = [... new Set(skus.map(sku => sku.sizeKey))];        
        const skusColors = [... new Set(skus.map(sku => sku.color))];

        // validate if sizeKey send are in records or not
        const [sizes, colors] = await Promise.all([
            MasterSizeModel.find({
                sizeKey: {
                    $in: skusSizeKeys
                },
                gender: product.gender
            }).select("sizeKey  primaryValue standard"),
            MasterColorModel.find({ name: { $in: skusColors } })
        ]);


        if (sizes.length !== skusSizeKeys.length) return res.status(400).json({ success: false, message: "Invalid size" });
        // validate if colors send are in records or not
        
        if (colors.length !== skusColors.length) return res.status(400).json({ success: false, message: "Invalid colors" });

        // check if the color exists in the product or not

        const colorsInProduct = new Set(product.colorStyles.map(color => color.colorName));

        const notFoundColorsInProduct = skusColors.filter(color => !colorsInProduct.has(color));

        if (notFoundColorsInProduct.length > 0) return res.status(400).json({
            success: false,
            message: "Please update the gallery of the product first in order to add these colors",
            data: {
                missingColors: notFoundColorsInProduct
            }
        });


        // if execution reaches this point then we can consider that we have valid colors and sizeKeys to add in the skus

        skus.forEach(sku => {
            const size = sizes.find(size => size.sizeKey === sku.sizeKey);
            //  each size contains : { sizeKey, primaryValue, standard } we have replaced the sizeKey to size 
            sku.size = size;
            delete sku.sizeKey;
        })

        const productDetails = {
            name: product.name,
            gender: product.gender,
            brand: product.brand
        };

        req.productDetails = productDetails;
        next();

    } catch (err) {
        res.status(500).json({ success: false, error: err.message });
    }

};


