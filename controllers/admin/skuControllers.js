
import ProductSKUModel from '../../models/ProductSKU.js';
import ProductModel from '../../models/Products.js';

export const addExtraSKU = async (req, res) => {
    try {
        const { product_id, color, size, sku_code, price, stock } = req.body;

        // 1. Verify the parent product exists
        const parentProduct = await ProductModel.findById(product_id);
        if (!parentProduct) {
            return res.status(404).json({ success: false, message: "Parent product not found" });
        }

        // 2. Check if this SKU code already exists (Safety check)
        const existingSKU = await ProductSKUModel.findOne({ sku_code });
        if (existingSKU) {
            return res.status(400).json({ success: false, message: "SKU code must be unique" });
        }

        // 3. Create the new SKU
        const newSKU = await ProductSKUModel.create(req.body);

        res.status(201).json({ success: true, data: newSKU });
    } catch (error) {
        res.status(400).json({ success: false, error: error.message });
    }
};


export const updateSKU = async(req, res)=>{
}

export const buldUpdatePrice = async( req, res )=>{
}

