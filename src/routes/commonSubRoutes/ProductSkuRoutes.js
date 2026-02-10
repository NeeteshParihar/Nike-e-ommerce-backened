
import { Router } from "express";
import { decrementStock, getProductSkuById } from "../../controllers/common/ProductSkuControllers.js";

const productSkuCommonRouter = Router();

productSkuCommonRouter.patch("/:id/stock", decrementStock);
productSkuCommonRouter.get("/:id", getProductSkuById);

export default productSkuCommonRouter;