import mongoose from 'mongoose';
import bcrypt from 'bcryptjs';

const loyaltyHistoryEntrySchema = new mongoose.Schema({
  type: { type: String, required: true },
  direction: {
    type: String,
    enum: ['earned', 'redeemed', 'reversed'],
    required: true,
  },
  points: { type: Number, required: true, min: 0 },
  description: { type: String, required: true },
  metadata: {
    type: mongoose.Schema.Types.Mixed,
    default: {},
  },
  createdAt: { type: Date, default: Date.now },
}, { _id: false });

const loyaltyActivityClaimSchema = new mongoose.Schema({
  activityId: { type: String, required: true },
  points: { type: Number, required: true, min: 0 },
  claimedAt: { type: Date, default: Date.now },
  claimYear: { type: Number, default: null },
}, { _id: false });

const loyaltyRewardRedemptionSchema = new mongoose.Schema({
  rewardId: { type: String, required: true },
  rewardName: { type: String, required: true },
  pointsCost: { type: Number, required: true, min: 0 },
  code: { type: String, required: true },
  redeemedAt: { type: Date, default: Date.now },
  status: {
    type: String,
    enum: ['available', 'used', 'expired'],
    default: 'available',
  },
}, { _id: false });

const userSchema = new mongoose.Schema({
  name: {
    type: String,
    required: true,
    trim: true
  },
  email: {
    type: String,
    required: true,
    unique: true,
    lowercase: true
  },
  password: {
    type: String,
    required: true,
    minlength: 6,
    select: false
  },
  phone: String,
  role: {
    type: String,
    enum: ['customer', 'admin'],
    default: 'customer'
  },
  addresses: [{
    street: String,
    city: String,
    state: String,
    zipCode: String,
    country: String,
    isDefault: Boolean
  }],
  wishlist: [{
    type: mongoose.Schema.Types.ObjectId,
    ref: 'Product'
  }],
  loyalty: {
    pointsBalance: {
      type: Number,
      default: 0,
      min: 0,
    },
    lifetimePoints: {
      type: Number,
      default: 0,
      min: 0,
    },
    redeemedPoints: {
      type: Number,
      default: 0,
      min: 0,
    },
    tier: {
      type: String,
      enum: ['bronze', 'silver', 'gold'],
      default: 'bronze',
    },
    birthday: {
      type: Date,
      default: null,
    },
    activityClaims: {
      type: [loyaltyActivityClaimSchema],
      default: [],
    },
    rewardRedemptions: {
      type: [loyaltyRewardRedemptionSchema],
      default: [],
    },
    history: {
      type: [loyaltyHistoryEntrySchema],
      default: [],
    },
  },
}, { timestamps: true });

userSchema.pre('save', async function(next) {
  if (!this.isModified('password')) return next();
  this.password = await bcrypt.hash(this.password, 12);
  next();
});

const User = mongoose.model('User', userSchema);
export default User;
