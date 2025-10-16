import Order from '../models/order.model.js';
import Cart from '../models/cart.model.js';
import Product from '../models/product.model.js';
import Sale from '../models/sales.model.js';

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
      shippingCost = 0,
      tax = 0,
      customerNotes = ''
    } = req.body;

    if (!shippingAddress || !shippingAddress.name || !shippingAddress.street || 
        !shippingAddress.city || !shippingAddress.zipCode || !shippingAddress.phone) {
      return res.status(400).json({
        success: false,
        message: 'Complete shipping address is required'
      });
    }

    const cart = await Cart.findOne({ user: req.user._id })
      .populate('items.product');

    if (!cart || cart.items.length === 0) {
      return res.status(400).json({
        success: false,
        message: 'Cart is empty'
      });
    }

    const orderItems = [];
    let subtotal = 0;

    for (const item of cart.items) {
      const product = await Product.findById(item.product._id);

      if (!product || !product.isActive) {
        return res.status(400).json({
          success: false,
          message: `Product ${item.product.name} is no longer available`
        });
      }

      const materialVariant = product.materialVariants.find(
        mv => mv.material === item.material
      );

      if (!materialVariant) {
        return res.status(400).json({
          success: false,
          message: `Material variant "${item.material}" not found for ${product.name}`
        });
      }

      const sizeVariant = materialVariant.sizeVariants.find(
        sv => sv.label === item.size
      );

      if (!sizeVariant) {
        return res.status(400).json({
          success: false,
          message: `Size "${item.size}" not found for ${product.name} in ${item.material}`
        });
      }

      if (sizeVariant.stock < item.quantity) {
        return res.status(400).json({
          success: false,
          message: `Insufficient stock for ${product.name} (${item.material} - ${item.size}). Only ${sizeVariant.stock} available.`
        });
      }

      const variantImage = product.images?.[0]?.url || 
                          product.images?.[0]?.url || 
                          '';

      orderItems.push({
        product: product._id,
        name: product.name,
        size: item.size,
        material: item.material,
        quantity: item.quantity,
        price: item.price,
        image: variantImage
      });

      subtotal += item.price * item.quantity;

      sizeVariant.stock -= item.quantity;
      
      materialVariant.stock = materialVariant.sizeVariants.reduce(
        (total, sv) => total + sv.stock, 
        0
      );

      await product.save();
    }

    const orderNumber = `ORD-${Date.now()}-${Math.floor(Math.random() * 1000)}`;

    const totalAmount = subtotal + shippingCost + tax;

    const order = await Order.create({
      orderNumber,
      user: req.user._id,
      items: orderItems,
      shippingAddress,
      subtotal,
      shippingCost,
      tax,
      totalAmount,
      paymentMethod,
      status: 'pending',
      paymentStatus: 'pending',
      customerNotes
    });

    cart.items = [];
    cart.totalAmount = 0;
    await cart.save();

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
