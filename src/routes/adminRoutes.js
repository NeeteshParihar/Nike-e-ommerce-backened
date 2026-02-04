import {Router} from 'express';
import productRouter from './adminSubRoutes/Product.js';
import categoryRouter from './adminSubRoutes/Category.js';

const adminRouter = Router();

// the parent router is /api/admin

// --- Product Operations ---
adminRouter.use("/product", productRouter);
// --- Category Operations ---
adminRouter.use("/category", categoryRouter);

export default adminRouter;