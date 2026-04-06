import test from 'node:test';
import assert from 'node:assert/strict';

import Category from '../models/category.model.js';
import Product from '../models/product.model.js';
import {
  getAllProducts,
  getProductsByCategory,
  searchProducts,
} from '../controllers/product.controllers.js';
import {
  createMockReq,
  createMockRes,
  createStubRegistry,
} from './helpers/controllerTestUtils.js';

test('searchProducts rejects an empty search query', async () => {
  const req = createMockReq({
    query: {},
  });
  const res = createMockRes();

  await searchProducts(req, res);

  assert.equal(res.statusCode, 400);
  assert.deepEqual(res.body, {
    success: false,
    message: 'Search query is required',
  });
});

test('getProductsByCategory returns 404 when the category slug does not exist', async () => {
  const stubs = createStubRegistry();
  stubs.stub(Category, 'findOne', () => ({
    select: () => ({
      lean: async () => null,
    }),
  }));

  const req = createMockReq({
    params: {
      categorySlug: 'missing-category',
    },
  });
  const res = createMockRes();

  try {
    await getProductsByCategory(req, res);
  } finally {
    stubs.restoreAll();
  }

  assert.equal(res.statusCode, 404);
  assert.deepEqual(res.body, {
    success: false,
    message: 'Category not found',
  });
});

test('getAllProducts returns catalog data with pagination and facets', async () => {
  const stubs = createStubRegistry();
  stubs.stub(Product, 'aggregate', async () => ([
    {
      data: [
        {
          _id: 'product-1',
          name: 'Silver Ring',
          slug: 'silver-ring',
          images: [{ url: 'https://example.com/ring.jpg', isPrimary: true }],
          materialVariants: [{ material: 'silver', price: 120, stock: 4, sizeVariants: [] }],
          category: { name: 'Rings', slug: 'rings' },
          subCategory: { name: 'Silver Rings', slug: 'silver-rings' },
        },
      ],
      total: [{ total: 1 }],
      categories: [{ value: 'rings', label: 'Rings', count: 1 }],
      subCategories: [{ value: 'silver-rings', label: 'Silver Rings', count: 1 }],
      materials: [{ value: 'silver', label: 'silver', count: 1 }],
      availability: [{ value: 'in_stock', count: 1 }],
      priceRange: [{ min: 120, max: 120 }],
    },
  ]));

  const req = createMockReq({
    query: {
      sort: 'popular',
      material: 'silver',
    },
  });
  const res = createMockRes();

  try {
    await getAllProducts(req, res);
  } finally {
    stubs.restoreAll();
  }

  assert.equal(res.statusCode, 200);
  assert.equal(res.body.success, true);
  assert.equal(res.body.pagination.total, 1);
  assert.equal(res.body.data.length, 1);
  assert.deepEqual(res.body.filters, {
    q: '',
    sort: 'popular',
    category: '',
    subCategory: '',
    materials: ['silver'],
    availability: [],
    minPrice: null,
    maxPrice: null,
  });
  assert.deepEqual(res.body.facets.availability, [
    {
      value: 'in_stock',
      label: 'In Stock',
      count: 1,
    },
  ]);
  assert.equal(res.body.data[0].category.name, 'Rings');
  assert.equal(res.body.data[0].subCategory.slug, 'silver-rings');
});
