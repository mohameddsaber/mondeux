import mongoose from 'mongoose';

const orderSchema = new mongoose.Schema({
  orderNumber: {
    type: String,
    required: true,
    unique: true
  },
  user: {
    type: mongoose.Schema.Types.ObjectId,
    ref: 'User',
    required: true
  },
  items: [{
    product: {
      type: mongoose.Schema.Types.ObjectId,
      ref: 'Product',
      required: true
    },
    name: String,
    size: {
      type: String,
      required: true
    },
    material: {
      type: String,
      required: true
    },
    quantity: {
      type: Number,
      required: true,
      min: 1
    },
    price: Number,
    image: String
  }],
  
  shippingAddress: {
    name: { type: String, required: true },
    street: { type: String, required: true },
    city: { type: String, required: true },
    state: String,
    zipCode: { type: String, required: true },
    country: { type: String, default: 'Egypt' },
    phone: { type: String, required: true }
  },
  
  subtotal: {
    type: Number,
    required: true
  },
  shippingCost: {
    type: Number,
    default: 0
  },
  tax: {
    type: Number,
    default: 0
  },
  discount: {
    type: Number,
    default: 0
  },
  pricing: {
    baseShippingCost: {
      type: Number,
      default: 0,
    },
    couponCode: {
      type: String,
      default: '',
      trim: true,
      uppercase: true,
    },
    firstOrderDiscount: {
      type: Number,
      default: 0,
    },
    campaignDiscount: {
      type: Number,
      default: 0,
    },
    couponDiscount: {
      type: Number,
      default: 0,
    },
    shippingDiscount: {
      type: Number,
      default: 0,
    },
    freeShippingThreshold: {
      type: Number,
      default: 0,
    },
    appliedPromotions: [{
      promotionId: {
        type: mongoose.Schema.Types.ObjectId,
        ref: 'Promotion',
        default: null,
      },
      name: String,
      code: String,
      type: String,
      source: String,
      amount: {
        type: Number,
        default: 0,
      },
    }],
  },
  loyaltyPointsAwarded: {
    type: Number,
    default: 0,
    min: 0,
  },
  totalAmount: {
    type: Number,
    required: true
  },
  
  // Payment
  paymentMethod: {
    type: String,
    enum: ['card','cash_on_delivery'],
    required: true
  },
  paymentStatus: {
    type: String,
    enum: ['pending', 'paid', 'failed', 'refunded'],
    default: 'pending'
  },
  paymentId: String,
  

  status: {
    type: String,
    enum: ['pending', 'processing', 'shipped', 'delivered', 'cancelled'],
    default: 'pending'
  },
  
  trackingNumber: String,
  shippingProvider: String,
  
  paidAt: Date,
  shippedAt: Date,
  deliveredAt: Date,
  cancelledAt: Date,
  
  customerNotes: String,
  adminNotes: String
}, { timestamps: true });


orderSchema.index({ user: 1, createdAt: -1 });
orderSchema.index({ status: 1 });
orderSchema.index({ createdAt: -1 });

const Order = mongoose.model('Order', orderSchema);
export default Order;
