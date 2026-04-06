import test from 'node:test';
import assert from 'node:assert/strict';
import bcrypt from 'bcryptjs';

import User from '../models/user.model.js';
import { login, register } from '../controllers/user.controllers.js';
import {
  createMockReq,
  createMockRes,
  createStubRegistry,
} from './helpers/controllerTestUtils.js';

test('register creates a user, sets auth cookie, and returns the public payload', async () => {
  process.env.JWT_SECRET = 'test-secret';

  const stubs = createStubRegistry();
  stubs.stub(User, 'findOne', async () => null);
  stubs.stub(User, 'create', async ({ name, email, phone }) => ({
    _id: 'user-123',
    name,
    email,
    phone,
    role: 'user',
  }));

  const req = createMockReq({
    body: {
      name: 'Mona',
      email: 'mona@example.com',
      password: 'Password123!',
      phone: '01000000000',
    },
  });
  const res = createMockRes();

  try {
    await register(req, res);
  } finally {
    stubs.restoreAll();
  }

  assert.equal(res.statusCode, 201);
  assert.equal(res.body.success, true);
  assert.equal(res.body.message, 'User registered successfully');
  assert.deepEqual(res.body.data, {
    _id: 'user-123',
    name: 'Mona',
    email: 'mona@example.com',
    role: 'user',
  });
  assert.equal(res.cookies.length, 1);
  assert.equal(res.cookies[0].name, 'jwt');
});

test('login authenticates valid credentials and sets auth cookie', async () => {
  process.env.JWT_SECRET = 'test-secret';

  const stubs = createStubRegistry();
  stubs.stub(User, 'findOne', () => ({
    select: async () => ({
      _id: 'user-123',
      name: 'Mona',
      email: 'mona@example.com',
      role: 'user',
      password: 'hashed-password',
    }),
  }));
  stubs.stub(bcrypt, 'compare', async () => true);

  const req = createMockReq({
    body: {
      email: 'mona@example.com',
      password: 'Password123!',
    },
  });
  const res = createMockRes();

  try {
    await login(req, res);
  } finally {
    stubs.restoreAll();
  }

  assert.equal(res.statusCode, 200);
  assert.equal(res.body.success, true);
  assert.equal(res.body.message, 'Logged in successfully');
  assert.deepEqual(res.body.data, {
    _id: 'user-123',
    name: 'Mona',
    email: 'mona@example.com',
    role: 'user',
  });
  assert.equal(res.cookies.length, 1);
  assert.equal(res.cookies[0].name, 'jwt');
});

test('login rejects invalid credentials', async () => {
  const stubs = createStubRegistry();
  stubs.stub(User, 'findOne', () => ({
    select: async () => ({
      _id: 'user-123',
      name: 'Mona',
      email: 'mona@example.com',
      role: 'user',
      password: 'hashed-password',
    }),
  }));
  stubs.stub(bcrypt, 'compare', async () => false);

  const req = createMockReq({
    body: {
      email: 'mona@example.com',
      password: 'wrong-password',
    },
  });
  const res = createMockRes();

  try {
    await login(req, res);
  } finally {
    stubs.restoreAll();
  }

  assert.equal(res.statusCode, 401);
  assert.deepEqual(res.body, {
    success: false,
    message: 'Invalid email or password',
  });
  assert.equal(res.cookies.length, 0);
});
