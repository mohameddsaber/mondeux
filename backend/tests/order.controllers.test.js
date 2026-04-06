import test from 'node:test';
import assert from 'node:assert/strict';

import Cart from '../models/cart.model.js';
import Order from '../models/order.model.js';
import Product from '../models/product.model.js';
import User from '../models/user.model.js';
import { createOrder } from '../controllers/order.controllers.js';
import {
  createMockReq,
  createMockRes,
  createStubRegistry,
} from './helpers/controllerTestUtils.js';

test('createOrder converts the cart into an order, decrements stock, and clears the cart', async () => {
  const stubs = createStubRegistry();
  let savedProduct = null;
  let savedCart = null;
  let createdOrderPayload = null;

  const product = {
    _id: 'product-1',
    name: 'Gold Ring',
    isActive: true,
    images: [{ url: 'https://example.com/ring.jpg' }],
    materialVariants: [
      {
        material: 'gold',
        stock: 2,
        sizeVariants: [{ label: 'M', stock: 2 }],
      },
    ],
    async save() {
      savedProduct = {
        materialVariants: this.materialVariants.map((variant) => ({
          material: variant.material,
          stock: variant.stock,
          sizeVariants: variant.sizeVariants.map((sizeVariant) => ({
            label: sizeVariant.label,
            stock: sizeVariant.stock,
          })),
        })),
      };
    },
  };

  const cart = {
    items: [
      {
        product: { _id: 'product-1', name: 'Gold Ring' },
        quantity: 1,
        price: 200,
        size: 'M',
        material: 'gold',
      },
    ],
    totalAmount: 200,
    async save() {
      savedCart = {
        items: [...this.items],
        totalAmount: this.totalAmount,
      };
    },
  };

  stubs.stub(Cart, 'findOne', () => ({
    populate: async () => cart,
  }));
  stubs.stub(Product, 'findById', async () => product);
  stubs.stub(User, 'findById', async () => ({
    _id: 'user-1',
    loyalty: {
      lifetimePoints: 0,
    },
    async save() {
      return this;
    },
  }));
  stubs.stub(Order, 'create', async (payload) => {
    createdOrderPayload = payload;
    return {
      _id: 'order-1',
      ...payload,
    };
  });

  const req = createMockReq({
    body: {
      shippingAddress: {
        name: 'Mona',
        street: '123 Nile St',
        city: 'Cairo',
        zipCode: '12345',
        phone: '01000000000',
      },
      paymentMethod: 'cash_on_delivery',
      shippingCost: 20,
      tax: 10,
      customerNotes: 'Leave at the door',
    },
  });
  const res = createMockRes();

  try {
    await createOrder(req, res);
  } finally {
    stubs.restoreAll();
  }

  assert.equal(res.statusCode, 201);
  assert.equal(res.body.success, true);
  assert.equal(res.body.message, 'Order placed successfully');
  assert.equal(createdOrderPayload.user, 'user-1');
  assert.equal(createdOrderPayload.subtotal, 200);
  assert.equal(createdOrderPayload.loyaltyPointsAwarded, 2);
  assert.equal(createdOrderPayload.totalAmount, 230);
  assert.equal(createdOrderPayload.items.length, 1);
  assert.match(createdOrderPayload.orderNumber, /^ORD-/);
  assert.deepEqual(savedCart, {
    items: [],
    totalAmount: 0,
  });
  assert.deepEqual(savedProduct, {
    materialVariants: [
      {
        material: 'gold',
        stock: 1,
        sizeVariants: [{ label: 'M', stock: 1 }],
      },
    ],
  });
});

test('createOrder rejects empty carts', async () => {
  const stubs = createStubRegistry();
  stubs.stub(Cart, 'findOne', () => ({
    populate: async () => ({
      items: [],
    }),
  }));

  const req = createMockReq({
    body: {
      shippingAddress: {
        name: 'Mona',
        street: '123 Nile St',
        city: 'Cairo',
        zipCode: '12345',
        phone: '01000000000',
      },
      paymentMethod: 'cash_on_delivery',
    },
  });
  const res = createMockRes();

  try {
    await createOrder(req, res);
  } finally {
    stubs.restoreAll();
  }

  assert.equal(res.statusCode, 400);
  assert.deepEqual(res.body, {
    success: false,
    message: 'Cart is empty',
  });
});
