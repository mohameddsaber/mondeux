import mongoose from 'mongoose';

const reviewSchema = new mongoose.Schema({
  product: {
    type: mongoose.Schema.Types.ObjectId,
    ref: 'Product',
    required: true,
  },
  user: {
    type: mongoose.Schema.Types.ObjectId,
    ref: 'User',
    required: true,
  },
  userName: {
    type: String,
    required: true,
    trim: true,
  },
  order: {
    type: mongoose.Schema.Types.ObjectId,
    ref: 'Order',
    default: null,
  },
  rating: {
    type: Number,
    required: true,
    min: 1,
    max: 5,
  },
  title: {
    type: String,
    trim: true,
    maxlength: 120,
    default: '',
  },
  comment: {
    type: String,
    required: true,
    trim: true,
    maxlength: 2000,
  },
  status: {
    type: String,
    enum: ['pending', 'approved', 'rejected'],
    default: 'pending',
  },
  verifiedPurchase: {
    type: Boolean,
    default: false,
  },
  moderationNote: {
    type: String,
    trim: true,
    maxlength: 500,
    default: '',
  },
  moderatedAt: {
    type: Date,
    default: null,
  },
  moderatedBy: {
    type: mongoose.Schema.Types.ObjectId,
    ref: 'User',
    default: null,
  },
}, { timestamps: true });

reviewSchema.index({ product: 1, status: 1, createdAt: -1 });
reviewSchema.index({ user: 1, createdAt: -1 });
reviewSchema.index({ status: 1, createdAt: -1 });
reviewSchema.index({ product: 1, user: 1 }, { unique: true });

const Review = mongoose.model('Review', reviewSchema);
export default Review;
