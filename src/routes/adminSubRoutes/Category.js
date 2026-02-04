import { Router } from "express";
import { createCategory, getCategoryById, getChildCategories } from "../../controllers/admin/categoryController.js";


const categoryRouter = Router();

// api_endpoint: /api/admin/category
categoryRouter.post("/", createCategory);

// api_endpoint: /api/admin/category/:id
categoryRouter.get("/:id", getCategoryById);

// api_endpoint: /api/admin/category/:id/children
categoryRouter.get("/:id/children", getChildCategories);

export default categoryRouter;