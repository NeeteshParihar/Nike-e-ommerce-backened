
import { Router } from "express";
import { getLeafCategories } from "../../middleware/productMiddlewares.js";
import { getProduct, searchProducts } from "../../controllers/common/ProductsControllers.js";

const productCommonRouter = Router();

productCommonRouter.get("/:id", getProduct);
productCommonRouter.get("/search/products",getLeafCategories,searchProducts);

export default productCommonRouter;