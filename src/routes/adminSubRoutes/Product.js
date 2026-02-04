
import { Router } from "express";
import { createProduct } from "../../controllers/admin/ProductsControllers.js";
import { updateProductDetails } from "../../controllers/admin/ProductsControllers.js";
import { preCheckColorGroup } from "../../middleware/products/checkColorCode.js";
import { addColorToGallery } from "../../controllers/admin/ProductsControllers.js";

const productRouter = Router(); 

// url_endpoint ==> /api/admin/product --> parent endpoint 
productRouter.post("/", createProduct);
// /api/admin/product/:id
productRouter.patch("/:id", updateProductDetails); 
// /api/admin/product/gallery/:id  --> deticated route for handling the addition of colorGallery
productRouter.post("/gallery/:id",preCheckColorGroup, addColorToGallery);

export default productRouter;

