import express from 'express';
import { getAllSubCategories, getSubCategoryBySlug, createSubCategory, updateSubCategory, deleteSubCategory } from '../controllers/subCategory.controller.js';
import { protect, admin } from '../middleware/auth.js';


const router = express.Router();
// Public routes
router.get('/', getAllSubCategories); 
router.get('/:slug', getSubCategoryBySlug); 

// Admin routes
router.post('/', protect, admin, createSubCategory); 
router.put('/:id', protect, admin, updateSubCategory);
router.delete('/:id', protect, admin, deleteSubCategory);

export default router;
