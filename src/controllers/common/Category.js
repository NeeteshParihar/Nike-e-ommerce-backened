import CategoryModel from "../../models/Category.js";
import mongoose from "mongoose";

export const getAggregatedFilters = async (req, res) => {
    try {

        const categoryId = req.params.id;
        // 1. Find all descendants (including the category itself)
        const categories = await CategoryModel.aggregate([
            { $match: { _id: new mongoose.Types.ObjectId(categoryId) } }, // find the parent
            {
                $graphLookup: {
                    from: "categories",
                    startWith: "$_id",
                    connectFromField: "_id",
                    connectToField: "parentId",
                    as: "descendants"
                }
            },
            {
                $project: {
                    _id: 1,
                    filterSnapShots: 1,
                    "descendants._id": 1,
                    "descendants.filterSnapShots": 1
                }
            }

        ]);


        if (!categories.length) return res.status(404).json({ success: false, message: "Category not found" });

        const allNodes = [{ _id: categories[0]._id, filterSnapShots: categories[0].filterSnapShots },
        ...categories[0].descendants.map(d => ({ _id: d._id, filterSnapShots: d.filterSnapShots }))];

        // 2. Identify which of these are leaves    
        const allIds = allNodes.map(node => node._id);
        const parentsInSystem = await CategoryModel.distinct("parentId", { parentId: { $in: allIds } });

        const parentSet = new Set(parentsInSystem.map(id => id.toString())); // make it set to search in o(1)
        const leafNodes = allNodes.filter(({ _id }) => !parentSet.has(_id.toString()));     

        const globalFilters = leafNodes.reduce((acc, leaf) => {

            const snapshots = leaf.filterSnapShots || {};           

            for (let key in snapshots) {
                // If this is a Mongoose sub-document, we convert to a plain object
                const currentFilter = snapshots[key];
                if (!currentFilter || !currentFilter.value) continue;

                if (!acc[key]) {
                    // Deep clone to avoid mutating the original leaf data in memory
                    acc[key] = {
                        label: currentFilter.label,
                        uiType: currentFilter.uiType,
                        value: [...currentFilter.value]
                    };
                } else if (key === "price") {
                    // Price Range Merge: [Min, Max]
                    acc[key].value[0] = Math.min(Number(acc[key].value[0]), Number(currentFilter.value[0])).toString();
                    acc[key].value[1] = Math.max(Number(acc[key].value[1]), Number(currentFilter.value[1])).toString();
                } else {
                    // Grid/List/Checkbox Merge: Unique Set of strings
                    acc[key].value = [...new Set([...acc[key].value, ...currentFilter.value])];
                }
            }
            return acc; // MUST return the accumulator
        }, {});

        res.status(200).json({ success: true, data: { filters: globalFilters } });

    } catch (err) {
        res.status(500).json({ success: false, error: err.message });
    }
};