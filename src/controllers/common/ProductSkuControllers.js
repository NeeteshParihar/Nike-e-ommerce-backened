
import ProductSKU from "../../models/ProductSKU.js";


export const decrementStock = async (req, res) => {
    try {

        const skuId = req.params.id;

        const updatedSku = await ProductSKU.findOneAndUpdate({
            _id: skuId,
            stock: { $gt: 0 }
        }, {
            $inc: { stock: -1 }
        }, {
            new: true
        })

        if(!updatedSku){
            return res.status(200).json({
                success: false, message: "Out of stock"
            })
        }       

    } catch (err) {
        return res.status(200).json({
            success: false, message: err.message, errorIn: "controllers/admin/ProductSku/decrementStock"
        })
    }
}

export const getProductSkuById = async (req, res) => {
    try {
        const skuId = req.params.id;
        const sku = await ProductSKU.findById(skuId);

        if (!sku) {
            return res.status(404).json({ success: false, message: "SKU not found" });
        }

        res.status(200).json({ success: true, data: sku });

    } catch (err) {
        res.status(500).json({ success: false, error: err.message });
    }
};
