
import MasterSizeModel from "../../models/Size.js";

export const createNewSizesBulk = async (req, res) => {
    try {
        const { sizes } = req.body; // Expecting an array of size objects

        if (!sizes || !Array.isArray(sizes) || sizes.length === 0) {
            return res.status(400).json({
                success: false,
                message: "Please provide an array of sizes to create."
            });
        }

        // 1. Prepare Bulk Operations
        const operations = sizes.map((size) => ({
            updateOne: {
                // We use sizeKey as the unique identifier
                filter: { sizeKey: size.sizeKey.toUpperCase() }, 
                // $setOnInsert ensures we don't overwrite existing size data by mistake
                update: { 
                    $setOnInsert: {
                        ...size,
                        sizeKey: size.sizeKey.toUpperCase() // Ensure consistency
                    } 
                },
                upsert: true
            }
        }));

        // 2. Execute Bulk Write
        // ordered: false allows valid operations to succeed even if others fail
        const result = await MasterSizeModel.bulkWrite(operations, { ordered: false });

        const addedCount = result.upsertedCount;
        const skippedCount = result.matchedCount;

        return res.status(201).json({
            success: true,
            message: "Master size update complete.",
            summary: {
                totalProcessed: sizes.length,
                added: addedCount,
                skipped: skippedCount
            },
            // List of the new internal Mongo IDs created
            newIds: Object.values(result.upsertedIds) 
        });

    } catch (err) {
        return res.status(500).json({
            success: false,
            error: err.message,
            errorIn: "controllers/admin/sizeControllers/createNewSizesBulk"
        });
    }
};