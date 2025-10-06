import express from 'express' ;
import { protect, admin }  from '../middleware/auth.js';
import { getAllCategories, getCategoryBySlug, getSubCategoriesByCategory, createCategory, updateCategory, deleteCategory } from '../controllers/category.controllers.js';
const router = express.Router();
// Public routes
router.get('/', getAllCategories); 
router.get('/:slug', getCategoryBySlug); 
router.get('/:categoryId/subcategories', getSubCategoriesByCategory);

// Admin routes
router.post('/', protect, admin, createCategory); 
router.put('/:id', protect, admin, updateCategory); 
router.delete('/:id', protect, admin, deleteCategory); 

export default router;