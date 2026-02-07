import {Router} from 'express';
import productRouter from './adminSubRoutes/Product.js';
import categoryRouter from './adminSubRoutes/Category.js';
import colorRouter from './adminSubRoutes/color.js';

const adminRouter = Router();

// the parent router is /api/admin

// --- Product Operations ---
adminRouter.use("/product", productRouter);
// --- Category Operations ---
adminRouter.use("/category", categoryRouter);
// --- Color collection operations ---
adminRouter.use("/color", colorRouter);

export default adminRouter;