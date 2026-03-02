import ProductSKU from "../../models/ProductSKU.js";
import { generateSkuCode } from "../../uitls/CodesGenerator.js";

export const createSkus = async (req, res) => {
    try {

        // heavy lifting is done by the middleware too
        // <------- this controller sole job is to create a new sku ------>
        const { productId, skus } = req.body;
        const { productDetails } = req;       // these are added in the middleware


        const operations = skus.map(sku => {

            const skuCode = generateSkuCode({ ...productDetails, ...sku });

            return {
                updateOne: {
                    // filter: { skuCode: skuCode }, // we can do it like this but in case 
                    filter: {  productId: productId, color: sku.color, "size.sizeKey": sku.size.sizeKey}, 
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

        const result = await ProductSKU.bulkWrite(operations, { ordered: false });

        const addedCount = result.upsertedCount;
        const skippedCount = result.matchedCount;
        const newIds = Object.values(result.upsertedIds);

        res.status(200).json({
            success: true,
            message: `Inventory update complete.`,
            data: {
                summary: {
                    totalProcessed: skus.length,
                    added: addedCount,
                    skipped: skippedCount,
                },
                newIds: newIds, // List of IDs for the newly created SKUs,                
            }
        });


    } catch (err) {
        console.log(err);
        res.status(500).json({ success: false, error: err.message, errorIn: "controllers/admin/ProductSku" });
    }
}



export const updateSku = async (req, res) => {
    try {
        const skuId = req.params.id;
        const { version } = req.body; // Or req.body
        const allowedFields = ["price", "mrp", "stock", "taxInfo", "countryOfOrigin"];

        // 1. Fetch current SKU to see existing values
        const currentSku = await ProductSKU.findOne({ _id: skuId, __v: version});
        if (!currentSku) return res.status(404).json({ success: false, message: "SKU not found" });

        // 2. Build the update object and perform cross-field validation
        const updates = {};
        for (const field of allowedFields) {
            if (req.body[field] !== undefined) {
                updates[field] = req.body[field];
            }
        }        

        // 3. LOGIC: Compare new values against current values in DB
        const finalPrice = updates.price !== undefined ? updates.price : currentSku.price;
        const finalMrp = updates.mrp !== undefined ? updates.mrp : currentSku.mrp;

        if (finalMrp < finalPrice) {
            return res.status(400).json({ 
                success: false, 
                message: "Update failed: MRP cannot be lower than Price.",
                context: { finalMrp, finalPrice }
            });
        }

        // 4. Perform the update with Version check
        const updatedSku = await ProductSKU.findOneAndUpdate(
            { _id: skuId, __v: version },
            { 
                $set: updates,
                $inc: { __v: 1 } // Increment version manually if not using middleware
            },
            { new: true, runValidators: true }
        );

        if (!updatedSku) {
            return res.status(409).json({ 
                success: false, 
                message: "Version mismatch! Another admin updated this record. Please refresh." 
            });
        }

        res.status(200).json({ success: true, data: updatedSku });

    } catch (err) {
        res.status(500).json({ success: false, error: err.message });
    }
};


