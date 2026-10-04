import { test, describe } from 'node:test';
import assert from 'node:assert/strict';
import request from 'supertest';
import app from '../src/app';
import { signToken } from '../src/utils/jwt';
import { Role } from '@prisma/client';
import {
  storeBrowseQuerySchema,
  ratingSubmitSchema,
  ownerRatingsQuerySchema,
} from '../src/validators/store.validator';

describe('Store, Rating & Store Owner Boundaries', () => {
  describe('Rating Validation Boundaries (1-5 Integer)', () => {
    test('should reject rating of 0', () => {
      const result = ratingSubmitSchema.safeParse({
        storeId: 'test-store-id',
        rating: 0,
      });
      assert.strictEqual(result.success, false);
    });

    test('should reject rating greater than 5', () => {
      const result = ratingSubmitSchema.safeParse({
        storeId: 'test-store-id',
        rating: 6,
      });
      assert.strictEqual(result.success, false);
    });

    test('should reject floating point ratings', () => {
      const result = ratingSubmitSchema.safeParse({
        storeId: 'test-store-id',
        rating: 4.5,
      });
      assert.strictEqual(result.success, false);
    });

    test('should accept boundary rating of 1', () => {
      const result = ratingSubmitSchema.safeParse({
        storeId: 'test-store-id',
        rating: 1,
      });
      assert.strictEqual(result.success, true);
    });

    test('should accept boundary rating of 5', () => {
      const result = ratingSubmitSchema.safeParse({
        storeId: 'test-store-id',
        rating: 5,
      });
      assert.strictEqual(result.success, true);
    });

    test('should reject missing storeId', () => {
      const result = ratingSubmitSchema.safeParse({
        rating: 4,
      });
      assert.strictEqual(result.success, false);
    });
  });

  describe('Rating Authorization Boundaries', () => {
    test('POST /api/ratings without token returns 401 Unauthorized', async () => {
      const res = await request(app).post('/api/ratings').send({
        storeId: 'some-store-id',
        rating: 5,
      });
      assert.strictEqual(res.status, 401);
      assert.strictEqual(res.body.success, false);
    });

    test('POST /api/ratings with ADMIN token returns 403 Forbidden (only normal users can rate)', async () => {
      const adminToken = signToken({
        id: 'admin-user-id',
        email: 'admin@example.com',
        role: Role.ADMIN,
      });

      const res = await request(app)
        .post('/api/ratings')
        .set('Authorization', `Bearer ${adminToken}`)
        .send({
          storeId: 'some-store-id',
          rating: 5,
        });

      assert.strictEqual(res.status, 403);
      assert.strictEqual(res.body.success, false);
    });

    test('POST /api/ratings with STORE_OWNER token returns 403 Forbidden', async () => {
      const ownerToken = signToken({
        id: 'owner-user-id',
        email: 'owner@example.com',
        role: Role.STORE_OWNER,
      });

      const res = await request(app)
        .post('/api/ratings')
        .set('Authorization', `Bearer ${ownerToken}`)
        .send({
          storeId: 'some-store-id',
          rating: 4,
        });

      assert.strictEqual(res.status, 403);
      assert.strictEqual(res.body.success, false);
    });
  });

  describe('Store Owner Authorization Boundaries', () => {
    test('GET /api/owner/stores without token returns 401 Unauthorized', async () => {
      const res = await request(app).get('/api/owner/stores');
      assert.strictEqual(res.status, 401);
      assert.strictEqual(res.body.success, false);
    });

    test('GET /api/owner/stores with regular USER token returns 403 Forbidden', async () => {
      const userToken = signToken({
        id: 'user-id',
        email: 'user@example.com',
        role: Role.USER,
      });

      const res = await request(app)
        .get('/api/owner/stores')
        .set('Authorization', `Bearer ${userToken}`);

      assert.strictEqual(res.status, 403);
      assert.strictEqual(res.body.success, false);
    });

    test('GET /api/owner/stores/:id/ratings without STORE_OWNER role returns 403 Forbidden', async () => {
      const userToken = signToken({
        id: 'user-id',
        email: 'user@example.com',
        role: Role.USER,
      });

      const res = await request(app)
        .get('/api/owner/stores/sample-store/ratings')
        .set('Authorization', `Bearer ${userToken}`);

      assert.strictEqual(res.status, 403);
      assert.strictEqual(res.body.success, false);
    });
  });

  describe('Store Query Schema Validation', () => {
    test('should parse valid store search and sorting parameters', () => {
      const result = storeBrowseQuerySchema.safeParse({
        page: '1',
        limit: '20',
        search: 'Grocery',
        sortBy: 'name',
        sortOrder: 'asc',
      });

      assert.strictEqual(result.success, true);
      if (result.success) {
        assert.strictEqual(result.data.page, 1);
        assert.strictEqual(result.data.limit, 20);
        assert.strictEqual(result.data.search, 'Grocery');
        assert.strictEqual(result.data.sortBy, 'name');
        assert.strictEqual(result.data.sortOrder, 'asc');
      }
    });

    test('should parse owner ratings pagination parameters', () => {
      const result = ownerRatingsQuerySchema.safeParse({
        page: '3',
        limit: '25',
      });

      assert.strictEqual(result.success, true);
      if (result.success) {
        assert.strictEqual(result.data.page, 3);
        assert.strictEqual(result.data.limit, 25);
      }
    });
  });
});
