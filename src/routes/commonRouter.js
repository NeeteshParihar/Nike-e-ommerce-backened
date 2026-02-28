
import { Router } from "express";
import productCommonRouter from "./commonSubRoutes/ProductRoutes.js";
import productSkuCommonRouter from "./commonSubRoutes/ProductSkuRoutes.js";
import categoryRouter from "./commonSubRoutes/CategoryRouter.js";


const commonRouter = Router();

commonRouter.use("/product", productCommonRouter);
commonRouter.use("/productSku", productSkuCommonRouter);
commonRouter.use("/category",categoryRouter);


export default commonRouter;
