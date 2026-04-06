import Order from '../models/order.model.js';
import Product from '../models/product.model.js';
import Review from '../models/review.model.js';
import { syncProductReviewStats } from '../utils/reviewStats.js';

const toPublicReview = (review) => ({
  _id: review._id,
  rating: review.rating,
  title: review.title,
  comment: review.comment,
  status: review.status,
  verifiedPurchase: Boolean(review.verifiedPurchase),
  userName: review.userName,
  createdAt: review.createdAt,
  moderationNote: review.moderationNote || '',
});

const findVerifiedOrder = (userId, productId) =>
  Order.findOne({
    user: userId,
    status: { $in: ['processing', 'shipped', 'delivered'] },
    'items.product': productId,
  }).select('_id');

export const getProductReviews = async (req, res) => {
  try {
    const { productId } = req.params;

    const [product, reviews, viewerReview] = await Promise.all([
      Product.findById(productId).select('_id rating numReviews'),
      Review.find({
        product: productId,
        status: 'approved',
      })
        .sort({ createdAt: -1 })
        .lean(),
      req.user
        ? Review.findOne({
          product: productId,
          user: req.user._id,
        }).lean()
        : Promise.resolve(null),
    ]);

    if (!product) {
      return res.status(404).json({
        success: false,
        message: 'Product not found',
      });
    }

    res.json({
      success: true,
      data: {
        stats: {
          averageRating: product.rating || 0,
          totalReviews: product.numReviews || 0,
        },
        items: reviews.map(toPublicReview),
        viewerReview: viewerReview
          ? {
            _id: viewerReview._id,
            rating: viewerReview.rating,
            title: viewerReview.title,
            comment: viewerReview.comment,
            status: viewerReview.status,
            moderationNote: viewerReview.moderationNote || '',
          }
          : null,
      },
    });
  } catch (error) {
    res.status(500).json({
      success: false,
      message: error.message,
    });
  }
};

export const createReview = async (req, res) => {
  try {
    const { productId } = req.params;
    const { rating, title = '', comment } = req.body;

    const [product, existingReview, verifiedOrder] = await Promise.all([
      Product.findById(productId).select('_id name isActive'),
      Review.findOne({
        product: productId,
        user: req.user._id,
      }),
      findVerifiedOrder(req.user._id, productId),
    ]);

    if (!product || !product.isActive) {
      return res.status(404).json({
        success: false,
        message: 'Product not found',
      });
    }

    if (!verifiedOrder) {
      return res.status(403).json({
        success: false,
        message: 'Only customers who purchased this product can review it',
      });
    }

    if (existingReview) {
      return res.status(400).json({
        success: false,
        message: 'You have already submitted a review for this product',
      });
    }

    const review = await Review.create({
      product: productId,
      user: req.user._id,
      userName: req.user.name,
      order: verifiedOrder._id,
      rating,
      title,
      comment,
      verifiedPurchase: true,
      status: 'pending',
    });

    res.status(201).json({
      success: true,
      message: 'Review submitted and pending moderation',
      data: {
        review: toPublicReview(review),
      },
    });
  } catch (error) {
    res.status(400).json({
      success: false,
      message: error.message,
    });
  }
};

export const getAdminReviews = async (req, res) => {
  try {
    const page = Number(req.query.page) || 1;
    const limit = Number(req.query.limit) || 20;
    const skip = (page - 1) * limit;
    const filter = {};

    if (req.query.status) {
      filter.status = req.query.status;
    }

    const [reviews, total] = await Promise.all([
      Review.find(filter)
        .sort({ createdAt: -1 })
        .limit(limit)
        .skip(skip)
        .populate('product', 'name slug')
        .populate('user', 'name email')
        .populate('moderatedBy', 'name email')
        .lean(),
      Review.countDocuments(filter),
    ]);

    res.json({
      success: true,
      data: reviews.map((review) => ({
        _id: review._id,
        rating: review.rating,
        title: review.title,
        comment: review.comment,
        status: review.status,
        verifiedPurchase: Boolean(review.verifiedPurchase),
        userName: review.userName,
        createdAt: review.createdAt,
        moderationNote: review.moderationNote || '',
        product: review.product,
        user: review.user,
        moderatedAt: review.moderatedAt,
        moderatedBy: review.moderatedBy,
      })),
      pagination: {
        page,
        limit,
        total,
        pages: Math.ceil(total / limit),
      },
    });
  } catch (error) {
    res.status(500).json({
      success: false,
      message: error.message,
    });
  }
};

export const moderateReview = async (req, res) => {
  try {
    const { reviewId } = req.params;
    const { status, moderationNote = '' } = req.body;

    const review = await Review.findById(reviewId);

    if (!review) {
      return res.status(404).json({
        success: false,
        message: 'Review not found',
      });
    }

    review.status = status;
    review.moderationNote = moderationNote;
    review.moderatedAt = new Date();
    review.moderatedBy = req.user._id;
    await review.save();

    await syncProductReviewStats(review.product);

    res.json({
      success: true,
      message: `Review ${status}`,
      data: {
        _id: review._id,
        status: review.status,
        moderationNote: review.moderationNote,
      },
    });
  } catch (error) {
    res.status(400).json({
      success: false,
      message: error.message,
    });
  }
};
