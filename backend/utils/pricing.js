import Order from '../models/order.model.js';
import Promotion from '../models/promotion.model.js';

export const STANDARD_SHIPPING_FEE = 120;
export const FREE_SHIPPING_THRESHOLD = 2500;
export const TAX_RATE = 0.14;
export const FIRST_ORDER_DISCOUNT_PERCENT = 10;
export const FIRST_ORDER_DISCOUNT_MAX = 500;

const roundCurrency = (value) => Number(Number(value || 0).toFixed(2));

const normalizeCode = (code) => {
  if (typeof code !== 'string') {
    return '';
  }

  return code.trim().toUpperCase();
};

const getLineSubtotal = (item) => roundCurrency(Number(item.price || 0) * Number(item.quantity || 0));

const isPromotionActive = (promotion, now) => {
  if (!promotion?.isActive) {
    return false;
  }

  if (promotion.startsAt && new Date(promotion.startsAt) > now) {
    return false;
  }

  if (promotion.endsAt && new Date(promotion.endsAt) < now) {
    return false;
  }

  return true;
};

const buildPromotionRecord = ({
  promotion,
  source,
  amount,
}) => ({
  promotionId: promotion?._id || null,
  name: promotion?.name || '',
  code: promotion?.code || '',
  type: promotion?.type || '',
  source,
  amount: roundCurrency(amount),
});

const calculatePromotionAmount = ({
  promotion,
  remainingSubtotal,
  currentShippingCost,
}) => {
  if (!promotion) {
    return 0;
  }

  if (promotion.type === 'free_shipping') {
    return roundCurrency(Math.min(currentShippingCost, STANDARD_SHIPPING_FEE));
  }

  if (promotion.type === 'percentage') {
    return roundCurrency((remainingSubtotal * Number(promotion.value || 0)) / 100);
  }

  return roundCurrency(Math.min(remainingSubtotal, Number(promotion.value || 0)));
};

const isPromotionEligible = async ({
  promotion,
  subtotal,
  isFirstOrder,
  userId,
}) => {
  if (!promotion) {
    return false;
  }

  if (subtotal < Number(promotion.minSubtotal || 0)) {
    return false;
  }

  if (promotion.firstOrderOnly && !isFirstOrder) {
    return false;
  }

  if (
    promotion.usageLimit !== null
    && promotion.usageLimit !== undefined
    && Number(promotion.usageCount || 0) >= Number(promotion.usageLimit)
  ) {
    return false;
  }

  if (
    userId
    && promotion.perUserLimit !== null
    && promotion.perUserLimit !== undefined
  ) {
    const existingUsageCount = await Order.countDocuments({
      user: userId,
      'pricing.appliedPromotions.promotionId': promotion._id,
    });

    if (existingUsageCount >= Number(promotion.perUserLimit)) {
      return false;
    }
  }

  return true;
};

const getFirstOrderDiscount = (subtotal) => {
  const rawDiscount = (subtotal * FIRST_ORDER_DISCOUNT_PERCENT) / 100;
  return roundCurrency(Math.min(rawDiscount, FIRST_ORDER_DISCOUNT_MAX));
};

export const calculateOrderPricing = async ({
  userId,
  items,
  couponCode = '',
}) => {
  const normalizedCouponCode = normalizeCode(couponCode);
  const subtotal = roundCurrency(items.reduce((sum, item) => sum + getLineSubtotal(item), 0));
  const baseShippingCost = subtotal >= FREE_SHIPPING_THRESHOLD ? 0 : STANDARD_SHIPPING_FEE;
  const now = new Date();

  const [existingOrderCount, autoPromotions, couponPromotion] = await Promise.all([
    userId
      ? Order.countDocuments({
        user: userId,
        status: { $ne: 'cancelled' },
      })
      : Promise.resolve(0),
    Promotion.find({ autoApply: true, isActive: true }).lean(),
    normalizedCouponCode
      ? Promotion.findOne({ code: normalizedCouponCode }).lean()
      : Promise.resolve(null),
  ]);

  const isFirstOrder = existingOrderCount === 0;
  const appliedPromotions = [];
  let remainingSubtotal = subtotal;
  let shippingCost = baseShippingCost;
  let firstOrderDiscount = 0;
  let campaignDiscount = 0;
  let couponDiscount = 0;
  let shippingDiscount = 0;
  let coupon = null;

  if (isFirstOrder && subtotal > 0) {
    firstOrderDiscount = getFirstOrderDiscount(subtotal);
    remainingSubtotal = roundCurrency(Math.max(0, remainingSubtotal - firstOrderDiscount));
    appliedPromotions.push({
      promotionId: null,
      name: 'First Order Discount',
      code: '',
      type: 'percentage',
      source: 'system',
      amount: firstOrderDiscount,
    });
  }

  const eligibleAutoPromotions = [];

  for (const promotion of autoPromotions) {
    if (!isPromotionActive(promotion, now)) {
      continue;
    }

    if (!(await isPromotionEligible({
      promotion,
      subtotal,
      isFirstOrder,
      userId,
    }))) {
      continue;
    }

    const amount = calculatePromotionAmount({
      promotion,
      remainingSubtotal,
      currentShippingCost: shippingCost,
    });

    if (amount <= 0) {
      continue;
    }

    eligibleAutoPromotions.push({
      promotion,
      amount,
    });
  }

  const bestOrderCampaign = eligibleAutoPromotions
    .filter(({ promotion }) => promotion.type !== 'free_shipping')
    .sort((left, right) => right.amount - left.amount)[0];

  const bestShippingCampaign = eligibleAutoPromotions
    .filter(({ promotion }) => promotion.type === 'free_shipping')
    .sort((left, right) => right.amount - left.amount)[0];

  if (bestOrderCampaign) {
    campaignDiscount = roundCurrency(bestOrderCampaign.amount);
    remainingSubtotal = roundCurrency(Math.max(0, remainingSubtotal - campaignDiscount));
    appliedPromotions.push(buildPromotionRecord({
      promotion: bestOrderCampaign.promotion,
      source: 'campaign',
      amount: campaignDiscount,
    }));
  }

  if (bestShippingCampaign) {
    const freeShippingAmount = roundCurrency(Math.min(shippingCost, bestShippingCampaign.amount));
    shippingDiscount += freeShippingAmount;
    shippingCost = roundCurrency(Math.max(0, shippingCost - freeShippingAmount));
    appliedPromotions.push(buildPromotionRecord({
      promotion: bestShippingCampaign.promotion,
      source: 'campaign',
      amount: freeShippingAmount,
    }));
  }

  if (normalizedCouponCode) {
    if (!couponPromotion || !isPromotionActive(couponPromotion, now)) {
      coupon = {
        code: normalizedCouponCode,
        status: 'invalid',
        message: 'Coupon code is invalid or inactive',
      };
    } else if (!(await isPromotionEligible({
      promotion: couponPromotion,
      subtotal,
      isFirstOrder,
      userId,
    }))) {
      coupon = {
        code: normalizedCouponCode,
        status: 'invalid',
        message: 'Coupon requirements are not met',
      };
    } else {
      const amount = calculatePromotionAmount({
        promotion: couponPromotion,
        remainingSubtotal,
        currentShippingCost: shippingCost,
      });

      if (couponPromotion.type === 'free_shipping') {
        shippingDiscount += amount;
        shippingCost = roundCurrency(Math.max(0, shippingCost - amount));
      } else {
        couponDiscount = amount;
        remainingSubtotal = roundCurrency(Math.max(0, remainingSubtotal - couponDiscount));
      }

      appliedPromotions.push(buildPromotionRecord({
        promotion: couponPromotion,
        source: 'coupon',
        amount,
      }));

      coupon = {
        code: normalizedCouponCode,
        status: 'applied',
        message: `${couponPromotion.name} applied`,
      };
    }
  }

  const tax = roundCurrency(remainingSubtotal * TAX_RATE);
  const totalDiscount = roundCurrency(firstOrderDiscount + campaignDiscount + couponDiscount + shippingDiscount);
  const totalAmount = roundCurrency(remainingSubtotal + shippingCost + tax);
  const amountToFreeShipping = baseShippingCost === 0
    ? 0
    : roundCurrency(Math.max(0, FREE_SHIPPING_THRESHOLD - subtotal));

  return {
    pricing: {
      subtotal,
      discountedSubtotal: remainingSubtotal,
      baseShippingCost,
      shippingCost,
      shippingDiscount: roundCurrency(shippingDiscount),
      tax,
      totalAmount,
      discount: totalDiscount,
      firstOrderDiscount: roundCurrency(firstOrderDiscount),
      campaignDiscount: roundCurrency(campaignDiscount),
      couponDiscount: roundCurrency(couponDiscount),
      couponCode: coupon?.status === 'applied' ? normalizedCouponCode : '',
      freeShippingThreshold: FREE_SHIPPING_THRESHOLD,
      amountToFreeShipping,
      appliedPromotions,
      firstOrderEligible: isFirstOrder,
    },
    coupon,
  };
};
