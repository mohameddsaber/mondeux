import express from 'express';
import { createRateLimiter } from '../middleware/rateLimit.js';
import { validateRequest } from '../middleware/validateRequest.js';
import {
  loginSchema,
  loyaltyActivityClaimSchema,
  loyaltyBirthdaySchema,
  loyaltyRewardRedeemSchema,
  registerSchema,
} from '../validation/requestSchemas.js';
import { attachUserIfPresent } from '../middleware/auth.js';
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
  deleteUser,
  isAuthenticated,
  isAdmin
} from '../controllers/user.controllers.js';
import { protect, admin } from '../middleware/auth.js';
import {
  claimLoyaltyActivity,
  getMyLoyalty,
  redeemLoyaltyReward,
  updateLoyaltyBirthday,
} from '../controllers/loyalty.controllers.js';
import { serializeSessionUser } from '../utils/loyaltyHelpers.js';

const router = express.Router();
const authRateLimit = createRateLimiter({
  windowMs: 15 * 60 * 1000,
  max: 10,
  message: 'Too many login or signup attempts. Please try again later.',
});

// Public routes
router.post('/register', attachUserIfPresent, authRateLimit, validateRequest(registerSchema), register);
router.post('/login', attachUserIfPresent, authRateLimit, validateRequest(loginSchema), login);



// Protected routes
router.get('/profile', protect, getUserProfile);
router.put('/profile', protect, updateUserProfile);
router.post('/logout', protect, logout);
router.get('/loyalty', protect, getMyLoyalty);
router.patch(
  '/loyalty/birthday',
  protect,
  validateRequest(loyaltyBirthdaySchema),
  updateLoyaltyBirthday
);
router.post(
  '/loyalty/claim',
  protect,
  validateRequest(loyaltyActivityClaimSchema),
  claimLoyaltyActivity
);
router.post(
  '/loyalty/redeem',
  protect,
  validateRequest(loyaltyRewardRedeemSchema),
  redeemLoyaltyReward
);

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



router.get('/me', isAuthenticated, (req, res) => {
  res.json({ success: true, user: serializeSessionUser(req.user) });
});
router.get('/admin', isAdmin, (req, res) => {
  res.json({ success: true, message: "Welcome, Admin!" });
});

export default router;
