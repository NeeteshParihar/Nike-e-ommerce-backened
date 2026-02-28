import CategoryModel from "../models/Category.js";
import ProductSKU from "../models/ProductSKU.js";
import ProductModel from "../models/Products.js";
import mongoose from "mongoose";

import dotenv from "dotenv";
dotenv.config({ path: "./.env" });

await mongoose.connect(process.env.MONGO_URL);


export const syncCategoryInventoryFilters = async () => {
    try {
        console.log("--- Starting Inventory Filter Sync (Price & Sizes) ---");

        // 1. Identify Leaf Categories
        const allCategories = await CategoryModel.find({}).select("_id parentId");
        const parentIds = new Set(allCategories.filter(c => c.parentId).map(c => c.parentId.toString()));
        const leafCategories = allCategories.filter(c => !parentIds.has(c._id.toString()));

        for (const leaf of leafCategories) {
            // 2. Aggregate SKU data for all active products in this leaf
            const inventoryData = await ProductModel.aggregate([
                { 
                    $match: { 
                        categoryIds: leaf._id, 
                        status: "active" 
                    } 
                },
                {
                    $lookup: {
                        from: "productskus",
                        localField: "_id",
                        foreignField: "productId",
                        as: "skus"
                    }
                },
                { $unwind: "$skus" },
                {
                    $group: {
                        _id: null,
                        minPrice: { $min: "$skus.price" },
                        maxPrice: { $max: "$skus.price" },
                        uniqueSizeKeys: { $addToSet: "$skus.size.sizeKey" },
                        uniqueColors: { $addToSet: "$skus.color" }
                    }
                }
            ]);

            if (inventoryData.length > 0) {
                const { minPrice, maxPrice, uniqueSizeKeys, uniqueColors } = inventoryData[0];

                // 3. Update the Snapshots in one atomic operation
                await CategoryModel.findByIdAndUpdate(leaf._id, {
                    $set: {
                        "filterSnapShots.price": {
                            key: "price",
                            label: "Price Range",
                            uiType: "range",
                            value: [minPrice.toString(), maxPrice.toString()]
                        },
                        "filterSnapShots.sizes": {
                            key: "sizes",
                            label: "Sizes",
                            uiType: "grid",
                            value: uniqueSizeKeys
                        },
                        "filterSnapShots.colors": {
                            key: "colors",
                            label: "Colors",
                            uiType: "grid",
                            value: uniqueColors
                        }
                    }
                });
                console.log(`Synced inventory for leaf: ${leaf.name}`);
            } else {
                // Clear snapshots if no active inventory exists
                await CategoryModel.findByIdAndUpdate(leaf._id, {
                    $unset: { 
                        "filterSnapShots.price": "", 
                        "filterSnapShots.sizes": "",
                        "filterSnapShots.colors": "" 
                    }
                });
            }
        }
        console.log("--- Inventory Filter Sync Completed ---");
    } catch (err) {
        console.error("Sync Error:", err.message);
    }
};

syncCategoryInventoryFilters();