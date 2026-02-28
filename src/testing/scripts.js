import mongoose from "mongoose";
import CategoryModel from "../models/Category.js";
import ProductModel from "../models/Products.js";
import dotenv from "dotenv";
dotenv.config({ path: "./.env" });




await mongoose.connect(process.env.MONGO_URL);

export const syncCategoryGenderFilters = async () => {
    try {
        console.log("--- Starting Gender Filter Sync ---");

        // 1. Get all category IDs and parentIds to identify leaves
        const allCategories = await CategoryModel.find({}).select("_id parentId");
        const parentIds = new Set(
            allCategories
                .filter(cat => cat.parentId)
                .map(cat => cat.parentId.toString())
        );

        // Filter to get only Leaf Categories
        const leafCategories = allCategories.filter(
            cat => !parentIds.has(cat._id.toString())
        );

        console.log(`Found ${leafCategories.length} leaf categories to process.`);

        for (const leaf of leafCategories) {
            // 2. Find all unique genders of products in this leaf category
            const uniqueGenders = await ProductModel.distinct("gender", {
                categoryIds: leaf._id,
                status: "active"
            });

            if (uniqueGenders.length > 0) {
                // 3. Update the filterSnapShot for this leaf
                await CategoryModel.findByIdAndUpdate(leaf._id, {
                    $set: {
                        "filterSnapShots.gender": {
                            key: "gender",
                            label: "Gender",
                            uiType: "checkbox",
                            value: uniqueGenders // e.g., ["Men", "Unisex"]
                        }
                    }
                });
                console.log(`Updated Gender filters for: ${leaf._id}`);
            } else {
                // If no products exist, clear the gender filter snapshot
                await CategoryModel.findByIdAndUpdate(leaf._id, {
                    $unset: { "filterSnapShots.gender": "" }
                });
            }
        }

        console.log("--- Gender Filter Sync Completed Successfully ---");
    } catch (err) {
        console.error("Error syncing gender filters:", err.message);
    }
};

syncCategoryGenderFilters()