
import ProductModel from "../../models/Products.js";

export const getProduct = async(req, res)=>{
    try{
        const productId = req.params.id;
        const product = await ProductModel.findById(productId);
        return res.status(200).json({ success: true, data: product });

    }catch(err){
        res.status(500).json({ success: false, error: err.message });    
    }
}