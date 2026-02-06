import { Router } from "express";
import { 
    createProduct, 
    updateProductDetails, 
    addColorToGallery, 
    updateProductCategories,
    deleteProduct,
    removeColorStyle,
    addImagesToExistingColor,
    removeImageFromColor
} from "../../controllers/admin/ProductsControllers.js";

import { preCheckColorGroup } from "../../middleware/products/checkColorCode.js";

const productRouter = Router(); 

// url_endpoint ==> /api/admin/product --> parent endpoint 
productRouter.post("/", createProduct);

productRouter.delete("/:id", deleteProduct);

// /api/admin/product/:id
productRouter.patch("/:id", updateProductDetails); 

// /api/admin/product/gallery/:id  --> deticated route for handling the addition of colorGallery 
productRouter.post("/gallery/:id",preCheckColorGroup, addColorToGallery);

// api/admin/product/:id/categories --> updating the product categories
productRouter.patch("/:id/categories", updateProductCategories);

productRouter.delete("/:id/color/:colorId", removeColorStyle );

productRouter.patch("/:id/color/:colorId/addImages", addImagesToExistingColor); 
productRouter.patch("/:id/color/:colorId/removeImages", removeImageFromColor);


export default productRouter;
