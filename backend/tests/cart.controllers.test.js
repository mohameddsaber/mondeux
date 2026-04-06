import test from 'node:test';
import assert from 'node:assert/strict';

import Cart from '../models/cart.model.js';
import Product from '../models/product.model.js';
import { getCart, updateCartItem } from '../controllers/cart.controllers.js';
import {
  createMockReq,
  createMockRes,
  createStubRegistry,
} from './helpers/controllerTestUtils.js';

test('getCart returns the populated cart and recalculates total amount', async () => {
  const stubs = createStubRegistry();
  let saveCalls = 0;

  const cart = {
    items: [
      {
        product: {
          _id: 'product-1',
          name: 'Gold Ring',
          isActive: true,
        },
        quantity: 2,
        price: 150,
        size: 'M',
        material: 'gold',
      },
    ],
    totalAmount: 0,
    async populate() {},
    async save() {
      saveCalls += 1;
    },
  };

  stubs.stub(Cart, 'findOne', async () => cart);

  const req = createMockReq();
  const res = createMockRes();

  try {
    await getCart(req, res);
  } finally {
    stubs.restoreAll();
  }

  assert.equal(saveCalls, 1);
  assert.equal(res.statusCode, 200);
  assert.equal(res.body.success, true);
  assert.equal(res.body.data.totalAmount, 300);
  assert.equal(res.body.data.items.length, 1);
});

test('updateCartItem increments quantity, refreshes price, and recalculates totals', async () => {
  const stubs = createStubRegistry();
  let saveCalls = 0;

  const cart = {
    items: [
      {
        product: 'product-1',
        quantity: 1,
        price: 100,
        size: 'M',
        material: 'gold',
      },
    ],
    totalAmount: 100,
    async populate() {
      this.items = this.items.map((item) => ({
        ...item,
        product: {
          _id: 'product-1',
          name: 'Gold Ring',
          isActive: true,
        },
      }));
    },
    async save() {
      saveCalls += 1;
    },
  };

  stubs.stub(Cart, 'findOne', async () => cart);
  stubs.stub(Product, 'findById', async () => ({
    _id: 'product-1',
    isActive: true,
    materialVariants: [
      {
        material: 'gold',
        price: 150,
        sizeVariants: [{ label: 'M', stock: 3 }],
      },
    ],
  }));

  const req = createMockReq({
    params: { productId: 'product-1' },
    body: { size: 'M', material: 'gold', delta: 1 },
  });
  const res = createMockRes();

  try {
    await updateCartItem(req, res);
  } finally {
    stubs.restoreAll();
  }

  assert.equal(saveCalls, 1);
  assert.equal(res.statusCode, 200);
  assert.equal(res.body.success, true);
  assert.equal(res.body.data.items[0].quantity, 2);
  assert.equal(res.body.data.items[0].price, 150);
  assert.equal(res.body.data.totalAmount, 300);
});
