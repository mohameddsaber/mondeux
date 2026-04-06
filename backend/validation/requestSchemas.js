import { z } from 'zod';

const objectIdSchema = z.string().regex(/^[0-9a-fA-F]{24}$/, 'Invalid id format');
const optionalTrimmedString = z.string().trim().optional();
const optionalSessionIdSchema = z.string().trim().min(1).max(128).optional();
const optionalNullableNumber = z.coerce.number().min(0).nullable().optional();

const emptyRequestSchema = z.object({
  body: z.object({}).passthrough(),
  params: z.object({}).passthrough(),
  query: z.object({}).passthrough(),
});

const materialEnum = z.enum(['gold', 'silver', 'stainless steel']);
const paymentMethodEnum = z.enum(['card', 'cash_on_delivery']);
const orderStatusEnum = z.enum(['pending', 'processing', 'shipped', 'delivered', 'cancelled']);
const paymentStatusEnum = z.enum(['pending', 'paid', 'failed', 'refunded']);
const reviewStatusEnum = z.enum(['pending', 'approved', 'rejected']);
const promotionTypeEnum = z.enum(['percentage', 'fixed_amount', 'free_shipping']);
const analyticsEventTypeEnum = z.enum([
  'product_view',
  'search',
  'add_to_cart',
  'checkout_started',
  'checkout_completed',
  'login_success',
  'login_failure',
  'signup_success',
  'signup_failure',
]);
const catalogSortEnum = z.enum([
  'featured',
  'price_asc',
  'price_desc',
  'newest',
  'popular',
  'best-selling',
  'relevance',
]);

const sizeVariantSchema = z.object({
  label: z.string().trim().min(1, 'Size label is required'),
  sku: z.string().trim().min(1, 'SKU is required'),
  stock: z.coerce.number().int().min(0, 'Stock must be 0 or greater'),
  price: optionalNullableNumber,
  isAvailable: z.boolean().optional(),
});

const materialVariantSchema = z.object({
  material: materialEnum,
  metalPurity: optionalTrimmedString,
  weight: optionalNullableNumber,
  price: z.coerce.number().min(0, 'Price must be 0 or greater'),
  compareAtPrice: optionalNullableNumber,
  costPrice: optionalNullableNumber,
  stock: z.coerce.number().int().min(0).optional(),
  sizeVariants: z.array(sizeVariantSchema).min(1, 'At least one size variant is required'),
});

const imageSchema = z.object({
  url: z.string().trim().url('Image URL must be valid'),
  alt: optionalTrimmedString,
  isPrimary: z.boolean().optional(),
});

const shippingAddressSchema = z.object({
  name: z.string().trim().min(1, 'Recipient name is required'),
  street: z.string().trim().min(1, 'Street is required'),
  city: z.string().trim().min(1, 'City is required'),
  state: optionalTrimmedString,
  zipCode: z.string().trim().min(1, 'Zip code is required'),
  country: z.string().trim().min(1).optional(),
  phone: z.string().trim().min(1, 'Phone is required'),
});

const paginationQuerySchema = z.object({
  page: z.coerce.number().int().min(1).optional(),
  limit: z.coerce.number().int().min(1).optional(),
  status: orderStatusEnum.optional(),
}).passthrough();

const analyticsBaseQuerySchema = z.object({
  days: z.coerce.number().int().min(1).max(365).optional().default(30),
  limit: z.coerce.number().int().min(1).max(25).optional().default(5),
}).passthrough();

export const registerSchema = z.object({
  body: z.object({
    name: z.string().trim().min(1, 'Name is required'),
    email: z.string().trim().email('Email must be valid'),
    password: z.string().min(6, 'Password must be at least 6 characters'),
    phone: optionalTrimmedString,
    sessionId: optionalSessionIdSchema,
  }),
  params: z.object({}),
  query: z.object({}),
});

export const loginSchema = z.object({
  body: z.object({
    email: z.string().trim().email('Email must be valid'),
    password: z.string().min(1, 'Password is required'),
    sessionId: optionalSessionIdSchema,
  }),
  params: z.object({}),
  query: z.object({}),
});

export const loyaltyBirthdaySchema = z.object({
  body: z.object({
    birthday: z.coerce.date(),
  }),
  params: z.object({}),
  query: z.object({}),
});

export const loyaltyActivityClaimSchema = z.object({
  body: z.object({
    activityId: z.string().trim().min(1, 'Activity is required'),
  }),
  params: z.object({}),
  query: z.object({}),
});

export const loyaltyRewardRedeemSchema = z.object({
  body: z.object({
    rewardId: z.string().trim().min(1, 'Reward is required'),
  }),
  params: z.object({}),
  query: z.object({}),
});

export const addToCartSchema = z.object({
  body: z.object({
    productId: objectIdSchema,
    quantity: z.coerce.number().int().min(1).default(1),
    size: z.string().trim().min(1, 'Size is required'),
    material: z.string().trim().min(1, 'Material is required'),
    sessionId: optionalSessionIdSchema,
  }),
  params: z.object({}),
  query: z.object({}),
});

export const updateCartItemSchema = z.object({
  body: z.object({
    size: z.string().trim().min(1, 'Size is required'),
    material: z.string().trim().min(1, 'Material is required'),
    delta: z.coerce.number().int().refine((value) => value !== 0, {
      message: 'Delta must be a non-zero integer',
    }),
  }),
  params: z.object({
    productId: objectIdSchema,
  }),
  query: z.object({}),
});

export const removeCartItemSchema = z.object({
  body: z.object({
    size: z.string().trim().min(1, 'Size is required'),
    material: z.string().trim().min(1, 'Material is required'),
  }),
  params: z.object({
    productId: objectIdSchema,
  }),
  query: z.object({}),
});

export const createOrderSchema = z.object({
  body: z.object({
    shippingAddress: shippingAddressSchema,
    paymentMethod: paymentMethodEnum,
    shippingCost: z.coerce.number().min(0).optional().default(0),
    tax: z.coerce.number().min(0).optional().default(0),
    customerNotes: z.string().optional().default(''),
    couponCode: z.string().trim().max(64).optional().default(''),
    sessionId: optionalSessionIdSchema,
  }),
  params: z.object({}),
  query: z.object({}),
});

export const orderPricingPreviewSchema = z.object({
  body: z.object({
    couponCode: z.string().trim().max(64).optional().default(''),
  }),
  params: z.object({}),
  query: z.object({}),
});

export const orderIdParamSchema = z.object({
  body: z.object({}).passthrough(),
  params: z.object({
    id: objectIdSchema,
  }),
  query: z.object({}).passthrough(),
});

export const orderListQuerySchema = z.object({
  body: z.object({}).passthrough(),
  params: z.object({}).passthrough(),
  query: paginationQuerySchema,
});

export const updateOrderStatusSchema = z.object({
  body: z.object({
    status: orderStatusEnum,
  }),
  params: z.object({
    id: objectIdSchema,
  }),
  query: z.object({}),
});

export const updatePaymentStatusSchema = z.object({
  body: z.object({
    paymentStatus: paymentStatusEnum,
  }),
  params: z.object({
    id: objectIdSchema,
  }),
  query: z.object({}),
});

export const updateShippingInfoSchema = z.object({
  body: z.object({
    trackingNumber: optionalTrimmedString,
    shippingProvider: optionalTrimmedString,
  }).refine(
    (value) => Boolean(value.trackingNumber || value.shippingProvider),
    'At least one shipping field is required'
  ),
  params: z.object({
    id: objectIdSchema,
  }),
  query: z.object({}),
});

export const createProductSchema = z.object({
  body: z.object({
    name: z.string().trim().min(1, 'Name is required'),
    slug: z.string().trim().min(1, 'Slug is required'),
    description: z.string().trim().min(1, 'Description is required'),
    images: z.array(imageSchema).default([]),
    category: objectIdSchema,
    subCategory: objectIdSchema,
    materialVariants: z.array(materialVariantSchema).min(1, 'At least one material variant is required'),
    tags: z.array(z.string().trim()).optional().default([]),
    isActive: z.boolean().optional(),
    isFeatured: z.boolean().optional(),
    lowStockThreshold: z.coerce.number().int().min(0).optional(),
    metaTitle: optionalTrimmedString,
    metaDescription: optionalTrimmedString,
    rating: z.coerce.number().min(0).max(5).optional(),
    numReviews: z.coerce.number().int().min(0).optional(),
  }),
  params: z.object({}),
  query: z.object({}),
});

export const updateProductSchema = z.object({
  body: createProductSchema.shape.body.partial(),
  params: z.object({
    id: objectIdSchema,
  }),
  query: z.object({}),
});

const catalogQuerySchema = z.object({
  q: optionalTrimmedString,
  page: z.coerce.number().int().min(1).optional(),
  limit: z.coerce.number().int().min(1).max(100).optional(),
  sort: catalogSortEnum.optional(),
  material: optionalTrimmedString,
  availability: optionalTrimmedString,
  minPrice: z.coerce.number().min(0).optional(),
  maxPrice: z.coerce.number().min(0).optional(),
  category: optionalTrimmedString,
  subCategory: optionalTrimmedString,
}).passthrough();

const slugParamSchema = z.object({
  slug: z.string().trim().min(1),
});

export const productListQuerySchema = z.object({
  body: z.object({}).passthrough(),
  params: z.object({}).passthrough(),
  query: catalogQuerySchema,
});

export const categoryProductsQuerySchema = z.object({
  body: z.object({}).passthrough(),
  params: z.object({
    categorySlug: slugParamSchema.shape.slug,
  }),
  query: catalogQuerySchema,
});

export const subCategoryProductsQuerySchema = z.object({
  body: z.object({}).passthrough(),
  params: z.object({
    subCategorySlug: slugParamSchema.shape.slug,
  }),
  query: catalogQuerySchema,
});

export const categoryAndSubCategoryProductsQuerySchema = z.object({
  body: z.object({}).passthrough(),
  params: z.object({
    categorySlug: slugParamSchema.shape.slug,
    subCategorySlug: slugParamSchema.shape.slug,
  }),
  query: catalogQuerySchema,
});

export const productReviewsParamSchema = z.object({
  body: z.object({}).passthrough(),
  params: z.object({
    productId: objectIdSchema,
  }),
  query: z.object({}).passthrough(),
});

export const createReviewSchema = z.object({
  body: z.object({
    rating: z.coerce.number().min(1).max(5),
    title: z.string().trim().max(120).optional().default(''),
    comment: z.string().trim().min(10).max(2000),
  }),
  params: z.object({
    productId: objectIdSchema,
  }),
  query: z.object({}),
});

export const reviewListQuerySchema = z.object({
  body: z.object({}).passthrough(),
  params: z.object({}).passthrough(),
  query: z.object({
    page: z.coerce.number().int().min(1).optional(),
    limit: z.coerce.number().int().min(1).max(100).optional(),
    status: reviewStatusEnum.optional(),
  }).passthrough(),
});

export const reviewModerationSchema = z.object({
  body: z.object({
    status: z.enum(['approved', 'rejected']),
    moderationNote: z.string().trim().max(500).optional().default(''),
  }),
  params: z.object({
    reviewId: objectIdSchema,
  }),
  query: z.object({}),
});

export const ingestEventSchema = z.object({
  body: z.object({
    eventType: analyticsEventTypeEnum,
    sessionId: z.string().trim().min(1).max(128),
    productId: objectIdSchema.optional(),
    orderId: objectIdSchema.optional(),
    metadata: z.record(z.string(), z.unknown()).optional().default({}),
    occurredAt: z.coerce.date().optional(),
  }),
  params: z.object({}),
  query: z.object({}),
});

export const analyticsFunnelQuerySchema = z.object({
  body: z.object({}).passthrough(),
  params: z.object({}).passthrough(),
  query: analyticsBaseQuerySchema.pick({ days: true }),
});

export const analyticsTopProductsQuerySchema = z.object({
  body: z.object({}).passthrough(),
  params: z.object({}).passthrough(),
  query: analyticsBaseQuerySchema.pick({ days: true, limit: true }),
});

export const analyticsRepeatCustomersQuerySchema = z.object({
  body: z.object({}).passthrough(),
  params: z.object({}).passthrough(),
  query: analyticsBaseQuerySchema.pick({ days: true, limit: true }),
});

export const analyticsLowConversionPagesQuerySchema = z.object({
  body: z.object({}).passthrough(),
  params: z.object({}).passthrough(),
  query: z.object({
    days: z.coerce.number().int().min(1).max(365).optional().default(30),
    limit: z.coerce.number().int().min(1).max(25).optional().default(5),
    minVisitors: z.coerce.number().int().min(1).max(5000).optional().default(10),
  }).passthrough(),
});

export const promotionListQuerySchema = z.object({
  body: z.object({}).passthrough(),
  params: z.object({}).passthrough(),
  query: z.object({
    active: z
      .union([z.boolean(), z.string().trim().toLowerCase().transform((value) => value === 'true')])
      .optional(),
  }).passthrough(),
});

const promotionBodySchema = z.object({
  name: z.string().trim().min(1).max(120),
  description: z.string().trim().max(400).optional().default(''),
  code: z.string().trim().max(64).optional().nullable(),
  type: promotionTypeEnum,
  value: z.coerce.number().min(0),
  autoApply: z.boolean().optional(),
  isActive: z.boolean().optional(),
  minSubtotal: z.coerce.number().min(0).optional(),
  firstOrderOnly: z.boolean().optional(),
  startsAt: z.union([z.coerce.date(), z.null()]).optional(),
  endsAt: z.union([z.coerce.date(), z.null()]).optional(),
  usageLimit: z.union([z.coerce.number().int().min(1), z.null()]).optional(),
  perUserLimit: z.union([z.coerce.number().int().min(1), z.null()]).optional(),
});

export const createPromotionSchema = z.object({
  body: promotionBodySchema,
  params: z.object({}),
  query: z.object({}),
});

export const updatePromotionSchema = z.object({
  body: promotionBodySchema.partial(),
  params: z.object({
    id: objectIdSchema,
  }),
  query: z.object({}),
});

export const passthroughSchema = emptyRequestSchema;
