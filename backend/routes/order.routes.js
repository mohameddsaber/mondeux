import express from 'express';

import { getMyOrders, getOrderById, createOrder, cancelOrder, getAllOrders, updateOrderStatus, updateShippingInfo, updatePaymentStatus } from '../controllers/order.controllers.js';
import  { protect, admin } from '../middleware/auth.js';
import { validateRequest } from '../middleware/validateRequest.js';
import {
  createOrderSchema,
  orderIdParamSchema,
  orderListQuerySchema,
  updateOrderStatusSchema,
  updatePaymentStatusSchema,
  updateShippingInfoSchema,
} from '../validation/requestSchemas.js';

const router = express.Router();
// Customer routes
router.get('/', protect, validateRequest(orderListQuerySchema), getMyOrders);
router.get('/:id', protect, validateRequest(orderIdParamSchema), getOrderById);
router.post('/', protect, validateRequest(createOrderSchema), createOrder);
router.patch('/:id/cancel', protect, validateRequest(orderIdParamSchema), cancelOrder);

// Admin routes
router.get('/admin/all', protect, admin, validateRequest(orderListQuerySchema), getAllOrders);
router.patch('/:id/status', protect, admin, validateRequest(updateOrderStatusSchema), updateOrderStatus);
router.patch('/:id/payment-status', protect, admin, validateRequest(updatePaymentStatusSchema), updatePaymentStatus);
router.patch('/:id/shipping', protect, admin, validateRequest(updateShippingInfoSchema), updateShippingInfo);

export default router;
