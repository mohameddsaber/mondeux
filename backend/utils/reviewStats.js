import Review from '../models/review.model.js';
import Product from '../models/product.model.js';

export const syncProductReviewStats = async (productId) => {
  const [stats] = await Review.aggregate([
    {
      $match: {
        product: productId,
        status: 'approved',
      },
    },
    {
      $group: {
        _id: '$product',
        averageRating: { $avg: '$rating' },
        totalReviews: { $sum: 1 },
      },
    },
  ]);

  await Product.findByIdAndUpdate(productId, {
    $set: {
      rating: stats ? Number(stats.averageRating.toFixed(1)) : 0,
      numReviews: stats?.totalReviews || 0,
    },
  });
};
