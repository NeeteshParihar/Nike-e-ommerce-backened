
import { Router } from "express";
import productCommonRouter from "./commonSubRoutes/ProductRoutes.js";
import productSkuCommonRouter from "./commonSubRoutes/ProductSkuRoutes.js";


const commonRouter = Router();

commonRouter.use("/product", productCommonRouter);
commonRouter.use("/productSku", productSkuCommonRouter);

export default commonRouter;




