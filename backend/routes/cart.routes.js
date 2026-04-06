import express from 'express';

import { protect } from '../middleware/auth.js';
import { validateRequest } from '../middleware/validateRequest.js';
import { addToCartSchema, removeCartItemSchema, updateCartItemSchema } from '../validation/requestSchemas.js';

import { getCart, addToCart, updateCartItem, removeFromCart, clearCart } from '../controllers/cart.controllers.js';

const router = express.Router();


router.get('/', protect, getCart);
router.post('/items', protect, validateRequest(addToCartSchema), addToCart);
router.put('/items/:productId', protect, validateRequest(updateCartItemSchema), updateCartItem);
router.delete('/items/:productId', protect, validateRequest(removeCartItemSchema), removeFromCart);
router.delete('/', protect, clearCart);

export default router;
