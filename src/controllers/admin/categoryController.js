
import CategoryModel from "../../models/Category.js";

export const createCategory = async (req, res) => {
    try {
        // Business Logic: If level > 0, ensure parent_category_id is provided
        const category = await CategoryModel.create(req.body);
        res.status(201).json({ success: true, data: category });

    } catch (error) {
        res.status(400).json({ success: false, error: error.message, errorIn: "controllers/admin/categoryController" });
    }
};

export const getCategoryById = async (req, res) => {
    try {

        const category = await CategoryModel.findById(req.params.id);
        if (!category) {
            return res.status(404).json({ success: false, message: "Category not found" });
        }
        res.status(200).json({ success: true, data: category });

    } catch (err) {
        res.status(500).json({ success: false, error: err.message, errorIn: "controllers/admin/categoryController" });
    }
}

export const getChildCategories = async (req, res) => {
    try {
        const categories = await CategoryModel.find({ parent_category_id: req.params.id });
        res.status(200).json({ success: true, data: categories });
    } catch (err) {
        res.status(500).json({ success: false, error: err.message, errorIn: "controllers/admin/categoryController" })
    }
}


