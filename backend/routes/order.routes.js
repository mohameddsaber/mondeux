import express from 'express';

import { getMyOrders, getOrderById, createOrder, cancelOrder, getAllOrders, updateOrderStatus, updateShippingInfo } from '../controllers/order.controllers.js';
import  { protect, admin } from '../middleware/auth.js';

const router = express.Router();
// Customer routes
router.get('/', protect, getMyOrders);
router.get('/:id', protect, getOrderById);
router.post('/', protect, createOrder);
router.patch('/:id/cancel', protect, cancelOrder);

// Admin routes
router.get('/admin/all', protect, admin, getAllOrders);
router.patch('/:id/status', protect, admin, updateOrderStatus);
router.patch('/:id/shipping', protect, admin, updateShippingInfo);

export default router;