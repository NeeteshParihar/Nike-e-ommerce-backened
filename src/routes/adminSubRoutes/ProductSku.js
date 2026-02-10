
import { Router } from "express";

// import middlewares contollers
import { validateSkusMiddleware } from "../../middleware/productSku/validateSku.js";
// import route controllers
import { createSkus, updateSku } from "../../controllers/admin/ProductSku.js";

const productSkuRouter = Router();


// /api/admin/productSku
productSkuRouter.post("/", validateSkusMiddleware, createSkus);
productSkuRouter.patch("/:id", updateSku);   

export default productSkuRouter;











