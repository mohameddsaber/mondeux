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

router.get('/', getAllProducts); // GET /api/products?page=1&limit=20
router.get('/featured', getFeaturedProducts); // GET /api/products/featured
router.get('/search', searchProducts); // GET /api/products/search?q=diamond
router.get('/category/:categorySlug', getProductsByCategory); // GET /api/products/category/rings
router.get('/subcategory/:subCategorySlug', getProductsBySubCategory); // GET /api/products/subcategory/wedding-rings
router.get('/category/:categorySlug/:subCategorySlug', getProductsByCategoryAndSubCategory); // GET /api/products/category/rings/wedding-rings
router.get('/:slug', getProductBySlug); // GET /api/products/diamond-solitaire-ring

// Admin routes
router.post('/', protect, admin, createProduct); // POST /api/products
router.put('/:id', protect, admin, updateProduct); // PUT /api/products/123
router.delete('/:id', protect, admin, deleteProduct); // DELETE /api/products/123
// router.patch('/:id/stock', protect, admin, updateStock); // PATCH /api/products/123/stock

export default router;