import mongoose from 'mongoose';

const eventTypes = [
  'product_view',
  'search',
  'add_to_cart',
  'checkout_started',
  'checkout_completed',
  'login_success',
  'login_failure',
  'signup_success',
  'signup_failure',
];

const eventSchema = new mongoose.Schema(
  {
    eventType: {
      type: String,
      enum: eventTypes,
      required: true,
      index: true,
    },
    user: {
      type: mongoose.Schema.Types.ObjectId,
      ref: 'User',
      default: null,
      index: true,
    },
    sessionId: {
      type: String,
      trim: true,
      default: '',
      index: true,
    },
    product: {
      type: mongoose.Schema.Types.ObjectId,
      ref: 'Product',
      default: null,
      index: true,
    },
    order: {
      type: mongoose.Schema.Types.ObjectId,
      ref: 'Order',
      default: null,
      index: true,
    },
    path: {
      type: String,
      trim: true,
      default: '',
    },
    method: {
      type: String,
      trim: true,
      default: '',
    },
    referrer: {
      type: String,
      trim: true,
      default: '',
    },
    userAgent: {
      type: String,
      trim: true,
      default: '',
    },
    ipAddress: {
      type: String,
      trim: true,
      default: '',
    },
    metadata: {
      type: mongoose.Schema.Types.Mixed,
      default: {},
    },
    occurredAt: {
      type: Date,
      default: Date.now,
      index: true,
    },
  },
  { timestamps: true }
);

eventSchema.index({ eventType: 1, occurredAt: -1 });
eventSchema.index({ eventType: 1, product: 1, occurredAt: -1 });
eventSchema.index({ user: 1, occurredAt: -1 });
eventSchema.index({ sessionId: 1, occurredAt: -1 });

const Event = mongoose.models.Event || mongoose.model('Event', eventSchema);

export { eventTypes };
export default Event;
