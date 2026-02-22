
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

        const pipeLine = [];

        // write down the match stage, this will utilize the index created to the collection
        const matchStage = {};
        matchStage.$match = {
            status: "active"
        };

        if (leafCategories && leafCategories.length > 0) {
            matchStage.$match.categoryIds = {
                $in: leafCategories
            }
        }

        if (gender) {
            matchStage.$match.gender = gender;
        }

        // perform the lookup operation to productSku
        const lookupStage = {
            $lookup: {
                from: "productskus",
                localField: "_id",
                foreignField: "productId",
                as: "productSkus"
            }
        }

        pipeLine.push(matchStage);
        pipeLine.push({
            $project: {
                _id: 1,
                name: 1,
                slug: 1,
                brand: 1,
                colorStyles: 1
            }
        })
        pipeLine.push(lookupStage);

        pipeLine.push({
            $unwind: "$productSkus"
        })

        pipeLine.push({
            $project: {
                _id: 1,
                name: 1,
                slug: 1,
                brand: 1,
                colorStyles: 1,
                "productSkus._id": 1,
                "productSkus.skuCode": 1,
                "productSkus.price": 1,
                "productSkus.size": 1,
                "productSkus.color": 1,
                "productSkus.stock": 1
            }
        })

        if (minPrice && maxPrice) {
            pipeLine.push({
                $match: {
                    "productSkus.price": {
                        $gte: minPrice,
                        $lte: maxPrice
                    }
                }
            })
        }

        if (colors && colors.length > 0) {
            pipeLine.push({
                $match: {
                    "productSkus.color": {
                        $in: colors
                    }
                }
            })
        }

        if (sizes && sizes.length > 0) {
            pipeLine.push({
                $match: {
                    "productSkus.size.sizeKey": {
                        $in: sizes
                    }
                }
            })
        }

        pipeLine.push({
            $group: {
                _id: "$_id",
                name: { $first: "$name" },
                slug: { $first: "$slug" },
                brand: { $first: "$brand" },
                colorStyles: { $first: "$colorStyles" },
                minPrice: { $min: "$productSkus.price" },              
            }
        })

        const products = await ProductModel.aggregate(pipeLine);
        return res.status(200).json({ success: true, data: products });

    } catch (err) {
        res.status(500).json({ success: false, error: err.message });

    }
}