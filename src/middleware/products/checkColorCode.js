import ProductModel from "../../models/Products.js";
import MasterColorModel from "../../models/color.js";


export const preCheckColorGroup = async (req, res, next) => {
    try {

        const colorName = req.headers['x-color-name'];      
        const category = req.headers['x-category'];   
        const version =  Number.parseInt(req.headers['x-version']) ;

        const productId = req.params.id;

        if( !Number.isInteger(version) ) return res.status(400).json({
            success: false, message: "Updates are not possible without version number"
        });

        if (!colorName || !category) {
            return res.status(400).json({ success: false, error: "Missing required headers" });
        }

        // we need the colorcode and the color group 
        const color = await MasterColorModel.findOne({
            name: colorName,            
        });

        if(!color) return res.status(400).json({
            success: false, message: "Invalid Color, please create the color first and try again",
            colorName
        });

        const colorCode = color.hexCode;
        const colorGroup = color.group; 

        // Check if the product already has this color name or hex code
        const productWithColor = await ProductModel.findOne({
            _id: productId,
            $or: [
                { "colorStyles.colorName": colorName },
                { "colorStyles.hexCode": colorCode },
                {__v: { $ne: version }}
            ],
            
        }).select("_id __v colorStyles.colorName colorStyles.hexCode");

        if(productWithColor) {
            return res.status(400).json({ success: false, message: "Color already exists or version conflict", data: productWithColor, currentVersion: productWithColor.__v, clientVersion: version });
        }        
        
        req.colorName = colorName;
        req.colorCode = colorCode;
        req.colorGroup = colorGroup;
        req.category = category;        
        req.version = version;
        
        next();
        
    } catch (err) {

        res.status(500).json({ success: false, error: err.message, errorIn: "middlewares/products/checkColorCode" });
    }
};