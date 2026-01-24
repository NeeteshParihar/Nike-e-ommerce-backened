import express from 'express';
const adminRouter = express.Router();

// Importing Controllers
import {createCategory, getCategoryById, getChildCategories} from '../controllers/admin/categoryController.js';
import { createFullProduct, updateProductDetails, updateColorGallery } from '../controllers/admin/ProductsControllers.js';
import { addExtraSKU, updateSKU, buldUpdatePrice } from '../controllers/admin/skuControllers.js';

// create the categories first 
adminRouter.post( "/categories", createCategory );
adminRouter.get( "/category/:id", getCategoryById );
adminRouter.get( "/categories/children/:id", getChildCategories );


// --- Product Master Operations ---
// Initial creation of a shoe and its variants (  SKU: stock keeping unit )
adminRouter.post('/products', createFullProduct);


// Update name, description, or storytelling blocks
adminRouter.patch('/products/:id', updateProductDetails);

// Specifically for adding/updating images for a color group
adminRouter.patch('/products/:id/gallery', updateColorGallery);


// --- Inventory & SKU Operations ---
// Add a single new size/color to an existing product
adminRouter.post('/skus', addExtraSKU);

// Update stock levels or individual price for one specific SKU
adminRouter.patch('/skus/:skuId', updateSKU);

// Strategy for sales: Update all SKU prices for a specific product ID
adminRouter.patch('/products/:id/bulk-price', buldUpdatePrice);

export default adminRouter;