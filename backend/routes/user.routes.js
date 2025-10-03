import express from 'express';
import {
  register,
  login,
  getUserProfile,
  updateUserProfile,
  logout,
  getWishlist,
  addToWishlist,
  removeFromWishlist,
  addAddress,
  updateAddress,
  deleteAddress,
  getAllUsers,
  getUserById,
  deleteUser
} from '../controllers/user.controllers.js';
import { protect, admin } from '../middleware/auth.js';

const router = express.Router();

// Public routes
router.post('/register', register);
router.post('/login', login);

// Protected routes
router.get('/profile', protect, getUserProfile);
router.put('/profile', protect, updateUserProfile);
router.post('/logout', protect, logout);

// Wishlist routes
router.get('/wishlist', protect, getWishlist);
router.post('/wishlist/:productId', protect, addToWishlist);
router.delete('/wishlist/:productId', protect, removeFromWishlist);

// Address routes
router.post('/addresses', protect, addAddress);
router.put('/addresses/:addressId', protect, updateAddress);
router.delete('/addresses/:addressId', protect, deleteAddress);

// Admin routes
router.get('/admin/all', protect, admin, getAllUsers);
router.get('/admin/:id', protect, admin, getUserById);
router.delete('/admin/:id', protect, admin, deleteUser);

export default router;