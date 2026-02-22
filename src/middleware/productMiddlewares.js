import ProductModel from "../models/Products.js";
import MasterColorModel from "../models/color.js";
import CategoryModel from "../models/Category.js";
import mongoose from "mongoose";


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


export const getLeafCategories = async (req, res, next) => {
    try {
        const { categoryId } = req.body;

        if (!categoryId) {
            return res.status(400).json({ success: false, message: "Category ID is required" });
        }

        // 1. Find all descendants of the given categoryId
        const categoryTree = await CategoryModel.aggregate([
            { $match: { _id: new mongoose.Types.ObjectId(categoryId) } },
            {
                $graphLookup: {
                    from: "categories", // The collection name
                    startWith: "$_id",
                    connectFromField: "_id",
                    connectToField: "parentId",
                    as: "descendants"
                }
            }
        ]);       

      

        if (!categoryTree.length) {
            return res.status(404).json({ success: false, message: "Category not found" });
        }

        // 2. Combine the starting category and its descendants into one list 
        // we adding the category Id as it can also be an leaf category
        const allIds = [
            categoryTree[0]._id, 
            ...categoryTree[0].descendants.map(cat => cat._id)
        ];

        // 3. Find which of these IDs are "Leaves" 
        // A leaf is a category that is NOT a parent to any other category
        const parentIdsInSystem = await CategoryModel.find({ 
            parentId: { $in: allIds } 
        }).distinct("parentId")
      

        const parentIdSet = new Set(parentIdsInSystem.map(id => id.toString()));
        
        // Filter the descendants to keep only those whose _id is NOT in the parentIdSet
        const leafCategories = [categoryTree[0]._id, ...categoryTree[0].descendants.map(cat => cat._id)].filter( _id => !parentIdSet.has(_id.toString()));

        req.body.leafCategories = leafCategories;
        next();          
           

    } catch (err) {
        return res.status(500).json({ success: false, error: err.message });
    }
};

