import Order from '../models/order.model.js';
import Cart from '../models/cart.model.js';
import Product from '../models/product.model.js';
import Promotion from '../models/promotion.model.js';
import Sale from '../models/sales.model.js';
import User from '../models/user.model.js';
import { trackEvent } from '../utils/trackEvent.js';
import {
  awardLoyaltyPoints,
  deductLoyaltyPoints,
} from '../utils/loyaltyHelpers.js';
import { calculatePurchasePoints } from '../utils/loyaltyProgram.js';
import { calculateOrderPricing } from '../utils/pricing.js';

const getPopulatedCart = (userId) => Cart.findOne({ user: userId }).populate('items.product');

const buildOrderItemsFromCart = async (cart) => {
  const orderItems = [];

  for (const item of cart.items) {
    const product = await Product.findById(item.product._id);

    if (!product || !product.isActive) {
      return {
        error: {
          success: false,
          message: `Product ${item.product.name} is no longer available`,
        },
      };
    }

    const materialVariant = product.materialVariants.find(
      (mv) => mv.material === item.material
    );

    if (!materialVariant) {
      return {
        error: {
          success: false,
          message: `Material variant "${item.material}" not found for ${product.name}`,
        },
      };
    }

    const sizeVariant = materialVariant.sizeVariants.find(
      (sv) => sv.label === item.size
    );

    if (!sizeVariant) {
      return {
        error: {
          success: false,
          message: `Size "${item.size}" not found for ${product.name} in ${item.material}`,
        },
      };
    }

    if (sizeVariant.stock < item.quantity) {
      return {
        error: {
          success: false,
          message: `Insufficient stock for ${product.name} (${item.material} - ${item.size}). Only ${sizeVariant.stock} available.`,
        },
      };
    }

    orderItems.push({
      productDoc: product,
      cartItem: item,
      materialVariant,
      sizeVariant,
      payload: {
        product: product._id,
        name: product.name,
        size: item.size,
        material: item.material,
        quantity: item.quantity,
        price: item.price,
        image: product.images?.[0]?.url || '',
      },
    });
  }

  return { orderItems };
};

export const previewOrderPricing = async (req, res) => {
  try {
    const cart = await getPopulatedCart(req.user._id);

    if (!cart || cart.items.length === 0) {
      return res.status(400).json({
        success: false,
        message: 'Cart is empty',
      });
    }

    const { pricing, coupon } = await calculateOrderPricing({
      userId: req.user._id,
      items: cart.items,
      couponCode: req.body.couponCode || '',
    });

    res.json({
      success: true,
      data: pricing,
      coupon,
    });
  } catch (error) {
    res.status(400).json({ success: false, message: error.message });
  }
};

export const getMyOrders = async (req, res) => {
  try {
    const page = parseInt(req.query.page) || 1;
    const limit = parseInt(req.query.limit) || 10;
    const skip = (page - 1) * limit;

    const orders = await Order.find({ user: req.user._id })
      .sort({ createdAt: -1 })
      .limit(limit)
      .skip(skip)
      .populate('items.product', 'name slug materialVariants')
      .select('-__v');

    const total = await Order.countDocuments({ user: req.user._id });

    res.json({
      success: true,
      data: orders,
      pagination: {
        page,
        limit,
        total,
        pages: Math.ceil(total / limit)
      }
    });
  } catch (error) {
    res.status(500).json({ success: false, message: error.message });
  }
};

export const getOrderById = async (req, res) => {
  try {
    const order = await Order.findById(req.params.id)
      .populate('items.product', 'name slug materialVariants');

    if (!order) {
      return res.status(404).json({
        success: false,
        message: 'Order not found'
      });
    }

    if (order.user.toString() !== req.user._id.toString() && req.user.role !== 'admin') {
      return res.status(403).json({
        success: false,
        message: 'Not authorized to view this order'
      });
    }

    res.json({
      success: true,
      data: order
    });
  } catch (error) {
    res.status(500).json({ success: false, message: error.message });
  }
};

export const createOrder = async (req, res) => {
  try {
    const {
      shippingAddress,
      paymentMethod,
      customerNotes = '',
      couponCode = '',
    } = req.body;

    if (!shippingAddress || !shippingAddress.name || !shippingAddress.street || 
        !shippingAddress.city || !shippingAddress.zipCode || !shippingAddress.phone) {
      return res.status(400).json({
        success: false,
        message: 'Complete shipping address is required'
      });
    }

    const cart = await getPopulatedCart(req.user._id);

    if (!cart || cart.items.length === 0) {
      return res.status(400).json({
        success: false,
        message: 'Cart is empty'
      });
    }

    const { orderItems: stockCheckedItems, error } = await buildOrderItemsFromCart(cart);

    if (error) {
      return res.status(400).json(error);
    }

    const { pricing, coupon } = await calculateOrderPricing({
      userId: req.user._id,
      items: cart.items,
      couponCode,
    });

    if (couponCode && coupon?.status === 'invalid') {
      return res.status(400).json({
        success: false,
        message: coupon.message,
      });
    }

    for (const item of stockCheckedItems) {
      item.sizeVariant.stock -= item.cartItem.quantity;

      item.materialVariant.stock = item.materialVariant.sizeVariants.reduce(
        (total, sizeVariant) => total + sizeVariant.stock,
        0
      );

      await item.productDoc.save();
    }

    const orderNumber = `ORD-${Date.now()}-${Math.floor(Math.random() * 1000)}`;
    const user = await User.findById(req.user._id);
    const loyaltyPointsAwarded = user
      ? calculatePurchasePoints({
        subtotal: pricing.discountedSubtotal,
        lifetimePoints: user.loyalty?.lifetimePoints || 0,
      })
      : 0;

    const order = await Order.create({
      orderNumber,
      user: req.user._id,
      items: stockCheckedItems.map((item) => item.payload),
      shippingAddress,
      subtotal: pricing.subtotal,
      shippingCost: pricing.shippingCost,
      tax: pricing.tax,
      discount: pricing.discount,
      pricing: {
        baseShippingCost: pricing.baseShippingCost,
        couponCode: pricing.couponCode,
        firstOrderDiscount: pricing.firstOrderDiscount,
        campaignDiscount: pricing.campaignDiscount,
        couponDiscount: pricing.couponDiscount,
        shippingDiscount: pricing.shippingDiscount,
        freeShippingThreshold: pricing.freeShippingThreshold,
        appliedPromotions: pricing.appliedPromotions,
      },
      loyaltyPointsAwarded,
      totalAmount: pricing.totalAmount,
      paymentMethod,
      status: 'pending',
      paymentStatus: 'pending',
      customerNotes
    });

    const promotionIds = pricing.appliedPromotions
      .map((promotion) => promotion.promotionId)
      .filter(Boolean);

    if (promotionIds.length > 0) {
      await Promotion.updateMany(
        { _id: { $in: promotionIds } },
        { $inc: { usageCount: 1 } }
      );
    }

    if (user && loyaltyPointsAwarded > 0) {
      awardLoyaltyPoints({
        user,
        points: loyaltyPointsAwarded,
        type: 'purchase',
        description: `Points earned from order ${orderNumber}`,
        metadata: {
          orderId: order._id,
          orderNumber,
          subtotal: pricing.discountedSubtotal,
        },
      });
      await user.save();
    }

    cart.items = [];
    cart.totalAmount = 0;
    await cart.save();

    await trackEvent({
      eventType: 'checkout_completed',
      req,
      userId: req.user?._id || null,
      sessionId: req.body.sessionId || '',
      orderId: order._id,
      metadata: {
        orderNumber,
        paymentMethod,
        totalAmount: pricing.totalAmount,
        subtotal: pricing.subtotal,
        discountedSubtotal: pricing.discountedSubtotal,
        shippingCost: pricing.shippingCost,
        tax: pricing.tax,
        discount: pricing.discount,
        couponCode: pricing.couponCode,
        itemCount: stockCheckedItems.reduce((sum, item) => sum + item.payload.quantity, 0),
      },
    });

    res.status(201).json({
      success: true,
      data: order,
      message: 'Order placed successfully'
    });
  } catch (error) {
    console.error('Error creating order:', error);
    res.status(400).json({ success: false, message: error.message });
  }
};

export const cancelOrder = async (req, res) => {
  try {
    const order = await Order.findById(req.params.id);

    if (!order) {
      return res.status(404).json({
        success: false,
        message: 'Order not found'
      });
    }

    if (order.user.toString() !== req.user._id.toString()) {
      return res.status(403).json({
        success: false,
        message: 'Not authorized to cancel this order'
      });
    }

    if (!['pending', 'processing'].includes(order.status)) {
      return res.status(400).json({
        success: false,
        message: 'Cannot cancel order at this stage'
      });
    }


    for (const item of order.items) {
      const product = await Product.findById(item.product);
      
      if (product) {
        const materialVariant = product.materialVariants.find(
          mv => mv.material === item.material
        );

        if (materialVariant) {
          const sizeVariant = materialVariant.sizeVariants.find(
            sv => sv.label === item.size
          );

          if (sizeVariant) {

            sizeVariant.stock += item.quantity;
            
            materialVariant.stock = materialVariant.sizeVariants.reduce(
              (total, sv) => total + sv.stock,
              0
            );

            await product.save();
          }
        }
      }
    }

    order.status = 'cancelled';
    order.cancelledAt = new Date();
    await order.save();

    if (order.loyaltyPointsAwarded > 0) {
      const user = await User.findById(order.user);

      if (user) {
        deductLoyaltyPoints({
          user,
          points: order.loyaltyPointsAwarded,
          type: 'purchase_reversal',
          description: `Points reversed after cancellation of order ${order.orderNumber}`,
          metadata: {
            orderId: order._id,
            orderNumber: order.orderNumber,
          },
          countAsRedeemed: false,
          affectLifetimePoints: true,
          direction: 'reversed',
        });

        await user.save();
      }
    }

    res.json({
      success: true,
      data: order,
      message: 'Order cancelled successfully'
    });
  } catch (error) {
    console.error('Error cancelling order:', error);
    res.status(500).json({ success: false, message: error.message });
  }
};

export const getAllOrders = async (req, res) => {
  try {
    const page = parseInt(req.query.page) || 1;
    const limit = parseInt(req.query.limit) || 20;
    const skip = (page - 1) * limit;

    const filter = {};
    if (req.query.status) {
      filter.status = req.query.status;
    }

    const orders = await Order.find(filter)
      .sort({ createdAt: -1 })
      .limit(limit)
      .skip(skip)
      .populate('user', 'name email')
      .select('-__v');

    const total = await Order.countDocuments(filter);

    res.json({
      success: true,
      data: orders,
      pagination: {
        page,
        limit,
        total,
        pages: Math.ceil(total / limit)
      }
    });
  } catch (error) {
    res.status(500).json({ success: false, message: error.message });
  }
};

export const updateShippingInfo = async (req, res) => {
  try {
    const { trackingNumber, shippingProvider } = req.body;

    const order = await Order.findById(req.params.id);

    if (!order) {
      return res.status(404).json({
        success: false,
        message: 'Order not found'
      });
    }

    if (trackingNumber) order.trackingNumber = trackingNumber;
    if (shippingProvider) order.shippingProvider = shippingProvider;

    await order.save();

    res.json({
      success: true,
      data: order
    });
  } catch (error) {
    res.status(400).json({ success: false, message: error.message });
  }
};

export const updateOrderStatus = async (req, res) => {
  try {
    const { status } = req.body;

    const order = await Order.findById(req.params.id);

    if (!order) {
      return res.status(404).json({
        success: false,
        message: 'Order not found'
      });
    }

    order.status = status;

    if (status === 'shipped') {
      order.shippedAt = new Date();
    } else if (status === 'delivered') {
      order.deliveredAt = new Date();
      order.paymentStatus = 'paid';
      order.paidAt = new Date();
        for (const item of order.items) {
          await Sale.create({
            productId: item.product._id,
            quantity: item.quantity,
            totalAmount: item.quantity * item.price,
          });
        }
      
    }

    await order.save();

    res.json({
      success: true,
      data: order
    });
  } catch (error) {
    res.status(400).json({ success: false, message: error.message });
  }
};



export const updatePaymentStatus = async (req, res) => {
  try {
    const { paymentStatus } = req.body;
    const { id } = req.params;

    const order = await Order.findById(id);

    if (!order) {
      return res.status(404).json({
        success: false,
        message: "Order not found",
      });
    }

    // Track previous status
    const previousStatus = order.paymentStatus;

    order.paymentStatus = paymentStatus;

    // If payment marked as paid and wasn’t before — add sales
    if (paymentStatus === "paid" && previousStatus !== "paid") {
      order.paidAt = new Date();

      for (const item of order.items) {
        await Sale.create({
          productId: item.product._id,
          quantity: item.quantity,
          totalAmount: item.quantity * item.price,
          date: new Date(),
        });
      }
    }

    // If payment is now unpaid or refunded — remove sales
    if (['pending', 'failed', 'refunded'].includes(paymentStatus) && previousStatus === "paid") {
      for (const item of order.items) {
        await Sale.deleteMany({ productId: item.product._id });
      }
      order.paidAt = null; // clear the payment timestamp
    }

    await order.save();

    res.status(200).json({
      success: true,
      data: order,
    });
  } catch (error) {
    console.error("Error updating payment status:", error);
    res.status(500).json({
      success: false,
      message: error.message,
    });
  }
};
