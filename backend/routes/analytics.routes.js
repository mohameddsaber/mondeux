import express from 'express';
import {
  getAnalyticsFunnel,
  getAnalyticsLowConversionPages,
  getAnalyticsRepeatCustomers,
  getAnalyticsTopProducts,
} from '../controllers/analytics.controllers.js';
import { protect, admin } from '../middleware/auth.js';
import { validateRequest } from '../middleware/validateRequest.js';
import {
  analyticsFunnelQuerySchema,
  analyticsLowConversionPagesQuerySchema,
  analyticsRepeatCustomersQuerySchema,
  analyticsTopProductsQuerySchema,
} from '../validation/requestSchemas.js';

const router = express.Router();

router.get('/funnel', protect, admin, validateRequest(analyticsFunnelQuerySchema), getAnalyticsFunnel);
router.get('/top-products', protect, admin, validateRequest(analyticsTopProductsQuerySchema), getAnalyticsTopProducts);
router.get('/repeat-customers', protect, admin, validateRequest(analyticsRepeatCustomersQuerySchema), getAnalyticsRepeatCustomers);
router.get('/low-conversion-pages', protect, admin, validateRequest(analyticsLowConversionPagesQuerySchema), getAnalyticsLowConversionPages);

export default router;
