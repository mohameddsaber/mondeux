import express from 'express';
import {
    getAllProducts,
    getFeaturedProducts,
    searchProducts,
    getProductsByCategory,
    getProductsBySubCategory,
    getProductsByCategoryAndSubCategory,
    getProductBySlug,
    createProduct,
    updateProduct,
    deleteProduct,

} from '../controllers/product.controllers.js';

import { protect, admin } from '../middleware/auth.js';

const router = express.Router();

//public routes
router.get('/', getAllProducts); 
router.get('/featured', getFeaturedProducts);
router.get('/search', searchProducts);
router.get('/category/:categorySlug', getProductsByCategory); 
router.get('/subcategory/:subCategorySlug', getProductsBySubCategory);
router.get('/category/:categorySlug/:subCategorySlug', getProductsByCategoryAndSubCategory);
router.get('/:slug', getProductBySlug);

// Admin routes
router.post('/', protect, admin, createProduct); 
router.put('/:id', protect, admin, updateProduct); 
router.delete('/:id', protect, admin, deleteProduct); 

export default router;