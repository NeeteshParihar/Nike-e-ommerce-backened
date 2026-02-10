import MasterColorModel from "../../models/color.js"


export const createNewColorsBulk = async (req, res) => {
    try {
        const { colors } = req.body; // Expecting an array of color objects

        if (!colors || !Array.isArray(colors) || colors.length === 0) {
            return res.status(400).json({
                success: false,
                message: "Please provide an array of colors to create."
            });
        }

        // Prepare Bulk Operations
        const operations = colors.map((color) => ({
            updateOne: {
                // Unique check by name (e.g., "University Red")
                filter: { name: color.name }, 
                update: { 
                    $setOnInsert: {
                        ...color,
                        // Ensure hex codes are always stored in uppercase for consistency
                        hexCode: color.hexCode.toUpperCase() 
                    } 
                },
                upsert: true
            }
        }));

        const result = await MasterColorModel.bulkWrite(operations, { ordered: false });

        return res.status(201).json({
            success: true,
            message: "Master colors update complete.",
            summary: {
                totalProcessed: colors.length,
                added: result.upsertedCount,
                skipped: result.matchedCount
            },
            newIds: Object.values(result.upsertedIds)
        });

    } catch (err) {
        return res.status(500).json({
            success: false,
            error: err.message,
            errorIn: "controllers/admin/colorControllers/createNewColorsBulk"
        });
    }
};
