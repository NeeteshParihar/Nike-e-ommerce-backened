
import { Router } from "express";
import { getProduct } from "../../controllers/common/ProductsControllers.js";

const productCommonRouter = Router();

productCommonRouter.get("/:id", getProduct);

export default productCommonRouter;