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

        if (skus.length > 50) return res.status(400).json({ success: false, message: "limit the number of skus to 50" });
        const product = await ProductModel.findById(productId).select("colorStyles brand gender name");
        if (!product) return res.status(404).json({ success: false, message: "Product not found" });

        // take out the colors: [ "university red", "blue", ...]
        let colorSet = new Set();
        let sizeSet = new Set();

        skus.forEach(sku => {
            sku.colors.forEach(c => colorSet.add(c.toLowerCase()));
            sizeSet.add(sku.sizeKey.toUpperCase());
        });

        // now validate the sku colors and sizes
        const [sizes, colors] = await Promise.all([
            MasterSizeModel.find({ sizeKey: { $in: Array.from(sizes) } }).select("sizeKey primaryValue standard"),
            MasterColorModel.find({ name: { $in: Array.from(colors) } }).select("name hexCode group")
        ]);

        if (sizes.length !== sizeSet.size || colors.length !== colorSet.size) return res.status(400).json({
            success: false, message: "Invalid colors or sizes"
        })

        const colorsInProduct = product.colorStyles.map(({ colors }) => colors.join("/"));
        let nonEligibleSkus = [];

        skus.forEach(({ colors }) => {
            const skuColor = colors.join("/");
            if (!colorsInProduct.includes(skuColor)) nonEligibleSkus.push(colors);
        })

        if (nonEligibleSkus.length > 0) return res.status(400).json({
            success: false, message: "Invalid colors Please make sure the product contains these colors first",
            data: {
                nonEligibleSkus
            }
        })

        // if the execution reaches this point this means: 1. sizes are valid, colors are valid and contained in product


        // data transformations
        skus.forEach(sku => {
            
            let completedColors = [];
            sku.colors.forEach(color => {
                let c = colors.find(c => c.name.toLowerCase() === color.toLowerCase());
            })

            let size = sizes.find(s => s.sizeKey.toUpperCase() === sku.sizeKey.toUpperCase());

            delete sku.sizeKey;
            // sort the colors in
            sku.colors.sort();
            sku.disPlayColors = sku.colors.join("/");
            sku.size = size;
            sku.colors = completedColors;           
        })

        const productDetails = {
            name: product.name,
            brand: product.brand,
            gender: product.gender
        }

        next();

    } catch (err) {
        res.status(500).json({ success: false, error: err.message });
    }


};
