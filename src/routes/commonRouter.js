
import { Router } from "express";
import { getProduct } from "../controllers/common/ProductsControllers.js";

const common = Router();

common.get("/product/:id",getProduct );

export default common;