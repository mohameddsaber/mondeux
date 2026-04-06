import mongoose from 'mongoose';

const promotionSchema = new mongoose.Schema({
  name: {
    type: String,
    required: true,
    trim: true,
  },
  description: {
    type: String,
    trim: true,
    default: '',
  },
  code: {
    type: String,
    trim: true,
    uppercase: true,
    default: null,
  },
  type: {
    type: String,
    enum: ['percentage', 'fixed_amount', 'free_shipping'],
    required: true,
  },
  value: {
    type: Number,
    required: true,
    min: 0,
  },
  autoApply: {
    type: Boolean,
    default: false,
  },
  isActive: {
    type: Boolean,
    default: true,
  },
  minSubtotal: {
    type: Number,
    default: 0,
    min: 0,
  },
  firstOrderOnly: {
    type: Boolean,
    default: false,
  },
  startsAt: {
    type: Date,
    default: null,
  },
  endsAt: {
    type: Date,
    default: null,
  },
  usageLimit: {
    type: Number,
    default: null,
    min: 1,
  },
  usageCount: {
    type: Number,
    default: 0,
    min: 0,
  },
  perUserLimit: {
    type: Number,
    default: null,
    min: 1,
  },
}, { timestamps: true });

promotionSchema.index({ isActive: 1, autoApply: 1, startsAt: 1, endsAt: 1 });
promotionSchema.index({ code: 1 }, { unique: true, sparse: true });

const Promotion = mongoose.model('Promotion', promotionSchema);
export default Promotion;
