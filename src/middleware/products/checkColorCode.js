import ProductModel from "../../models/Products.js";

export const preCheckColorGroup = async (req, res, next) => {
    try {

        const colorName = req.headers['x-color-name'];
        const colorCode = req.headers['x-color-code'];
        const category = req.headers['x-category'];



        //  these are values in case we want to add this product as default but another default already exists
        const overwriteDefault = req.headers['x-overwrite-default'] === 'true'; // Expecting "true" string
        const isNewDefault = req.headers['x-is-default'] === 'true';

        const productId = req.params.id;

        if (!colorName || !colorCode) {
            return res.status(400).json({ success: false, error: "Missing required headers" });
        }

        // 1. Fetch the product and check for duplicates AND existing defaults
        const product = await ProductModel.findById(productId);
        if (!product) return res.status(404).json({ success: false, error: "Product not found" });

        const nameExists = product.color_styles.some(color => color.color_name === colorName);

        if (nameExists) {
            return res.status(400).json({ success: false, error: `Color ${colorName} already exists.` });
        }

        //  as this colorName does'nt exists we can add add it but if we wanna make this as default then we have to do this check
        if (isNewDefault) {

            // check if there is any color which is default
            const currentDefault = product.color_styles.find(color => color.is_default);

            // there is one case which we don't care --> currentDefault not exists and overWrite is false in this case we can make it default

            if (currentDefault && !overwriteDefault) {
                return res.status(409).json({
                    success: false,
                    message: "A default color already exists.",
                    currentDefault: currentDefault.color_name,
                    actionRequired: "Set 'x-overwrite-default' header to true to confirm change."
                });
            }
           
        }

        req.color_name = colorName;
        req.color_code = colorCode;
        req.is_default = isNewDefault;
        req.category = category;

        next();
        
    } catch (err) {

        res.status(500).json({ success: false, error: err.message, errorIn: "middlewares/products/checkColorCode" });
    }
};