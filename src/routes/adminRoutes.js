import {Router} from 'express';
import productRouter from './adminSubRoutes/Product.js';
import categoryRouter from './adminSubRoutes/Category.js';
import colorRouter from './adminSubRoutes/color.js';
import sizeRouter from './adminSubRoutes/Size.js';
import productSkuRouter from './adminSubRoutes/ProductSku.js';

const adminRouter = Router();

// the parent router is /api/admin

// --- Product Operations ---
adminRouter.use("/product", productRouter);
// -- ProductSku Operations ----
adminRouter.use("/productSku", productSkuRouter);
// --- Category Operations ---
adminRouter.use("/category", categoryRouter);
// --- Color collection operations ---
adminRouter.use("/color", colorRouter);
adminRouter.use("/size", sizeRouter); 

export default adminRouter;


