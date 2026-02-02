import express from 'express';
import { preCheckColorGroup } from '../middleware/products/checkColorCode.js';



const adminRouter = express.Router();


// Importing Controllers
import {createCategory, getCategoryById, getChildCategories} from '../controllers/admin/categoryController.js';
import { createProduct, updateProductDetails, updateColorGallery } from '../controllers/admin/ProductsControllers.js';
import { addExtraSKU, updateSKU, buldUpdatePrice } from '../controllers/admin/skuControllers.js';

// create the categories first 
adminRouter.post( "/categories", createCategory );
adminRouter.get( "/category/:id", getCategoryById );
adminRouter.get( "/categories/children/:id", getChildCategories );


// add the product 
adminRouter.post('/product', createProduct);


// Update name, description, or storytelling blocks
adminRouter.patch('/products/:id', updateProductDetails);

// Specifically for adding/updating images for a color group
adminRouter.patch('/products/gallery/:id', preCheckColorGroup, updateColorGallery);


// --- Inventory & SKU Operations ---
// Add a single new size/color to an existing product
adminRouter.post('/skus', addExtraSKU);

// Update stock levels or individual price for one specific SKU
adminRouter.patch('/skus/:skuId', updateSKU);

// Strategy for sales: Update all SKU prices for a specific product ID
adminRouter.patch('/products/:id/bulk-price', buldUpdatePrice);

export default adminRouter;