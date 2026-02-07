
import ProductSKU from "../../models/ProductSKU.js";
import { generateSkuCode } from "../../uitls/CodesGenerator.js";



export const createSkus = async (req, res) => {
    try {

        //  <------------ make sure you have validated SKU's at data validation or data sanitation layer ----------->

        const { SKUs, productId } = req.body;

        // make sure to add these checks in middleWare or using Zod to keep code clean

        // each sku will contain size, color, price, stock and mrp, the productId will be added, and skuCode will be generated here

        if (!SKUs || !Array.isArray(SKUs) || SKUs.length === 0) return res.status(400).json({
            success: false,
            message: "SKUs are requiured and must be a list of sKU",
            SKUs
        });

        if (SKUs.length > 100) {
            return res.status(400).json({
                success: false,
                message: "Please limit the number of SKUs to 100"
            });
        }

        const operations = SKUs.map(sku => {

            const skuCode = generateSkuCode(sku)

            return {
                updateOne: {
                    filter: { skuCode: skuCode },
                    update: {
                        $setOnInsert: {
                            ...sku,
                            productId,
                            skuCode,
                        }
                    }, // this make sure it only update if its a new record
                    upsert: true  // this will create if not exists
                }
            };
        });

        // Execute the bulk write , ordered: false will make sure if some of the operations fails then it will contibue to insert new ones
        const result = await ProductSKU.bulkWrite(operations, { ordered: false });

        /**
             * result.upsertedCount: Number of new records created
             * result.upsertedIds: An object mapping index to the new _id
             * result.matchedCount: Number of SKUs that already existed (skipped)
        */

        const addedCount = result.upsertedCount;
        const skippedCount = result.matchedCount;
        const newIds = Object.values(result.upsertedIds);

        console.log(result);


        res.status(200).json({
            success: true,
            message: `Inventory update complete.`,
            summary: {
                totalProcessed: SKUs.length,
                added: addedCount,
                skipped: skippedCount
            },
            newIds: newIds // List of IDs for the newly created SKUs
        });


    } catch (err) {
        res.status(500).json({ success: false, error: err.message });
    }  
}

