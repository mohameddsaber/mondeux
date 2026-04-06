import express from 'express';
import { validateRequest } from '../middleware/validateRequest.js';
import { attachUserIfPresent, protect, admin } from '../middleware/auth.js';
import {
  createReviewSchema,
  productReviewsParamSchema,
  reviewModerationSchema,
  reviewListQuerySchema,
} from '../validation/requestSchemas.js';
import {
  createReview,
  getAdminReviews,
  getProductReviews,
  moderateReview,
} from '../controllers/review.controllers.js';

const router = express.Router();

router.get(
  '/product/:productId',
  attachUserIfPresent,
  validateRequest(productReviewsParamSchema),
  getProductReviews
);
router.post(
  '/product/:productId',
  protect,
  validateRequest(createReviewSchema),
  createReview
);

router.get(
  '/admin',
  protect,
  admin,
  validateRequest(reviewListQuerySchema),
  getAdminReviews
);
router.patch(
  '/:reviewId/moderate',
  protect,
  admin,
  validateRequest(reviewModerationSchema),
  moderateReview
);

export default router;
