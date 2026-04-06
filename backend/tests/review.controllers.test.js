import test from 'node:test';
import assert from 'node:assert/strict';

import Order from '../models/order.model.js';
import Product from '../models/product.model.js';
import Review from '../models/review.model.js';
import { createReview, moderateReview } from '../controllers/review.controllers.js';
import {
  createMockReq,
  createMockRes,
  createStubRegistry,
} from './helpers/controllerTestUtils.js';

test('createReview rejects users who have not purchased the product', async () => {
  const stubs = createStubRegistry();

  stubs.stub(Product, 'findById', () => ({
    select: async () => ({
      _id: 'product-1',
      name: 'Gold Ring',
      isActive: true,
    }),
  }));
  stubs.stub(Review, 'findOne', async () => null);
  stubs.stub(Order, 'findOne', () => ({
    select: async () => null,
  }));

  const req = createMockReq({
    params: { productId: '507f191e810c19729de860ea' },
    body: {
      rating: 5,
      title: 'Great piece',
      comment: 'Loved the packaging and the quality of the ring.',
    },
    user: {
      _id: 'user-1',
      name: 'Mona',
      role: 'user',
    },
  });
  const res = createMockRes();

  try {
    await createReview(req, res);
  } finally {
    stubs.restoreAll();
  }

  assert.equal(res.statusCode, 403);
  assert.deepEqual(res.body, {
    success: false,
    message: 'Only customers who purchased this product can review it',
  });
});

test('createReview creates a pending verified-purchase review for eligible customers', async () => {
  const stubs = createStubRegistry();
  let createdReviewPayload = null;

  stubs.stub(Product, 'findById', () => ({
    select: async () => ({
      _id: 'product-1',
      name: 'Gold Ring',
      isActive: true,
    }),
  }));
  stubs.stub(Review, 'findOne', async () => null);
  stubs.stub(Order, 'findOne', () => ({
    select: async () => ({
      _id: 'order-1',
    }),
  }));
  stubs.stub(Review, 'create', async (payload) => {
    createdReviewPayload = payload;
    return {
      _id: 'review-1',
      createdAt: '2026-04-06T00:00:00.000Z',
      moderationNote: '',
      ...payload,
    };
  });

  const req = createMockReq({
    params: { productId: '507f191e810c19729de860ea' },
    body: {
      rating: 4,
      title: 'Elegant',
      comment: 'The finish is clean and it looks exactly like the photos.',
    },
    user: {
      _id: 'user-1',
      name: 'Mona',
      role: 'user',
    },
  });
  const res = createMockRes();

  try {
    await createReview(req, res);
  } finally {
    stubs.restoreAll();
  }

  assert.equal(res.statusCode, 201);
  assert.equal(res.body.success, true);
  assert.equal(res.body.message, 'Review submitted and pending moderation');
  assert.deepEqual(createdReviewPayload, {
    product: '507f191e810c19729de860ea',
    user: 'user-1',
    userName: 'Mona',
    order: 'order-1',
    rating: 4,
    title: 'Elegant',
    comment: 'The finish is clean and it looks exactly like the photos.',
    verifiedPurchase: true,
    status: 'pending',
  });
});

test('moderateReview updates status and syncs product rating stats', async () => {
  const stubs = createStubRegistry();
  let syncedProductUpdate = null;

  const reviewDocument = {
    _id: 'review-1',
    product: 'product-1',
    status: 'pending',
    moderationNote: '',
    moderatedAt: null,
    moderatedBy: null,
    async save() {
      return this;
    },
  };

  stubs.stub(Review, 'findById', async () => reviewDocument);
  stubs.stub(Review, 'aggregate', async () => [
    {
      _id: 'product-1',
      averageRating: 4.5,
      totalReviews: 2,
    },
  ]);
  stubs.stub(Product, 'findByIdAndUpdate', async (productId, update) => {
    syncedProductUpdate = { productId, update };
    return null;
  });

  const req = createMockReq({
    params: { reviewId: '507f191e810c19729de860eb' },
    body: {
      status: 'approved',
      moderationNote: 'Verified order matched and review content is acceptable.',
    },
    user: {
      _id: 'admin-1',
      role: 'admin',
    },
  });
  const res = createMockRes();

  try {
    await moderateReview(req, res);
  } finally {
    stubs.restoreAll();
  }

  assert.equal(res.statusCode, 200);
  assert.equal(reviewDocument.status, 'approved');
  assert.equal(reviewDocument.moderationNote, 'Verified order matched and review content is acceptable.');
  assert.equal(reviewDocument.moderatedBy, 'admin-1');
  assert.equal(res.body.success, true);
  assert.deepEqual(syncedProductUpdate, {
    productId: 'product-1',
    update: {
      $set: {
        rating: 4.5,
        numReviews: 2,
      },
    },
  });
});
