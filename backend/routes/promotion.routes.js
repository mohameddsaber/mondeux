import express from 'express';
import { protect, admin } from '../middleware/auth.js';
import { validateRequest } from '../middleware/validateRequest.js';
import {
  createPromotionSchema,
  promotionListQuerySchema,
  updatePromotionSchema,
} from '../validation/requestSchemas.js';
import {
  createPromotion,
  getAdminPromotions,
  updatePromotion,
} from '../controllers/promotion.controllers.js';

const router = express.Router();

router.get('/admin', protect, admin, validateRequest(promotionListQuerySchema), getAdminPromotions);
router.post('/admin', protect, admin, validateRequest(createPromotionSchema), createPromotion);
router.patch('/admin/:id', protect, admin, validateRequest(updatePromotionSchema), updatePromotion);

export default router;
