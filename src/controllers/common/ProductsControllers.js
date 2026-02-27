
import ProductModel from "../../models/Products.js";

export const getProduct = async (req, res) => {
    try {
        const productId = req.params.id;

        const product = await ProductModel.findById(productId);
        return res.status(200).json({ success: true, data: product });

    } catch (err) {
        res.status(500).json({ success: false, error: err.message });
    }
}

export const searchProducts = async (req, res) => {
    try {

        const { leafCategories, gender, minPrice, maxPrice, colors, sizes } = req.body;
        const pipeline = [];

        // 1. Initial Product Filter (Category, Gender, Status)
        // This stage uses the Product indexes (categoryIds, gender, status)
        const productMatch = { status: "active" };
        if (leafCategories?.length > 0) productMatch.categoryIds = { $in: leafCategories };
        if (gender) productMatch.gender = gender;

        pipeline.push({ $match: productMatch });

        // 2. Optimized Lookup with Filtering
        // We filter the SKUs INSIDE the lookup so we don't bring unnecessary data into memory
        pipeline.push({
            $lookup: {
                from: "productskus", // the collection
                let: { prodId: "$_id" }, // let is used to make varibale to store the values from parentdoc, here prodId is the variable which can be accessed using $$prodId
                pipeline: [
                    {
                        $match: {
                            $expr: { $eq: ["$productId", "$$prodId"] }, // match the productId field in the productSku with  $$prodId
                            ...(minPrice && maxPrice ? { price: { $gte: minPrice, $lte: maxPrice } } : {}),
                            ...(colors?.length > 0 ? { color: { $in: colors.map(c => c.toLowerCase()) } } : {}),
                            ...(sizes?.length > 0 ? { "size.sizeKey": { $in: sizes } } : {})
                        }
                    }
                ],
                as: "matchingSkus"
            }
        });

        // 3. The "Existence" Filter
        // If a user filtered by size, we ONLY want products that have at least one matching SKU
        pipeline.push({
            $match: { "matchingSkus.0": { $exists: true } }
        });

        // 4. Final Projection
        // Instead of $group, we just shape the data. This is faster.
        pipeline.push({
            $project: {
                _id: 1,
                name: 1,
                slug: 1,
                brand: 1,
                colorStyles: {
                    $map: {
                        input: "$colorStyles",
                        as: "style",
                        in: {
                            hexCode: "$$style.hexCode",
                            colorName: "$$style.colorName",
                            primaryImage: "$$style.primaryImage"
                        }
                    }
                },
                // Show the user the lowest price available for their specific filters
                displayPrice: { $min: "$matchingSkus.price" },
                // Optional: return count of matching variants
                variantCount: { $size: "$matchingSkus" }
            }
        });

        const products = await ProductModel.aggregate(pipeline);
        return res.status(200).json({ success: true, count: products.length, data: products });

    } catch (err) {
        res.status(500).json({ success: false, error: err.message });
    }
};



