import { test, describe } from 'node:test';
import assert from 'node:assert/strict';
import request from 'supertest';
import app from '../src/app';
import { signToken } from '../src/utils/jwt';
import { Role } from '@prisma/client';
import {
  adminCreateUserSchema,
  adminCreateStoreSchema,
  adminResetUserPasswordSchema,
  userListQuerySchema,
  storeListQuerySchema,
} from '../src/validators/admin.validator';

describe('Admin Schemas and Authorization Tests', () => {
  describe('Admin Authorization Boundaries', () => {
    test('GET /api/admin/dashboard without token returns 401 Unauthorized', async () => {
      const res = await request(app).get('/api/admin/dashboard');
      assert.strictEqual(res.status, 401);
      assert.strictEqual(res.body.success, false);
      assert.ok(res.body.message.includes('token is required'));
    });

    test('GET /api/admin/dashboard with USER token returns 403 Forbidden', async () => {
      const userToken = signToken({
        id: 'regular-user-id',
        email: 'user@example.com',
        role: Role.USER,
      });

      const res = await request(app)
        .get('/api/admin/dashboard')
        .set('Authorization', `Bearer ${userToken}`);

      assert.strictEqual(res.status, 403);
      assert.strictEqual(res.body.success, false);
      assert.ok(res.body.message.includes('permission'));
    });

    test('GET /api/admin/dashboard with STORE_OWNER token returns 403 Forbidden', async () => {
      const ownerToken = signToken({
        id: 'owner-user-id',
        email: 'owner@example.com',
        role: Role.STORE_OWNER,
      });

      const res = await request(app)
        .get('/api/admin/dashboard')
        .set('Authorization', `Bearer ${ownerToken}`);

      assert.strictEqual(res.status, 403);
      assert.strictEqual(res.body.success, false);
      assert.ok(res.body.message.includes('permission'));
    });

    test('POST /api/admin/users without admin role returns 403 Forbidden', async () => {
      const userToken = signToken({
        id: 'regular-user-id',
        email: 'user@example.com',
        role: Role.USER,
      });

      const res = await request(app)
        .post('/api/admin/users')
        .set('Authorization', `Bearer ${userToken}`)
        .send({
          name: 'Some Person With Long Name Over Twenty',
          email: 'admin2@example.com',
          password: 'Password@123',
          role: Role.ADMIN,
        });

      assert.strictEqual(res.status, 403);
      assert.strictEqual(res.body.success, false);
    });

    test('DELETE /api/admin/users/:id without admin role returns 403 Forbidden', async () => {
      const userToken = signToken({
        id: 'regular-user-id',
        email: 'user@example.com',
        role: Role.USER,
      });

      const res = await request(app)
        .delete('/api/admin/users/target-user-id')
        .set('Authorization', `Bearer ${userToken}`);

      assert.strictEqual(res.status, 403);
      assert.strictEqual(res.body.success, false);
    });

    test('DELETE /api/admin/stores/:id without admin role returns 403 Forbidden', async () => {
      const userToken = signToken({
        id: 'regular-user-id',
        email: 'user@example.com',
        role: Role.USER,
      });

      const res = await request(app)
        .delete('/api/admin/stores/target-store-id')
        .set('Authorization', `Bearer ${userToken}`);

      assert.strictEqual(res.status, 403);
      assert.strictEqual(res.body.success, false);
    });

    test('DELETE /api/admin/ratings/:id without admin role returns 403 Forbidden', async () => {
      const userToken = signToken({
        id: 'regular-user-id',
        email: 'user@example.com',
        role: Role.USER,
      });

      const res = await request(app)
        .delete('/api/admin/ratings/target-rating-id')
        .set('Authorization', `Bearer ${userToken}`);

      assert.strictEqual(res.status, 403);
      assert.strictEqual(res.body.success, false);
    });

    test('POST /api/admin/users/:id/reset-password without admin role returns 403 Forbidden', async () => {
      const userToken = signToken({
        id: 'regular-user-id',
        email: 'user@example.com',
        role: Role.USER,
      });

      const res = await request(app)
        .post('/api/admin/users/target-user-id/reset-password')
        .set('Authorization', `Bearer ${userToken}`)
        .send({});

      assert.strictEqual(res.status, 403);
      assert.strictEqual(res.body.success, false);
      assert.ok(res.body.message.includes('permission'));
    });

    test('POST /api/admin/users/:id/reset-password with STORE_OWNER token returns 403 Forbidden', async () => {
      const ownerToken = signToken({
        id: 'owner-user-id',
        email: 'owner@example.com',
        role: Role.STORE_OWNER,
      });

      const res = await request(app)
        .post('/api/admin/users/target-user-id/reset-password')
        .set('Authorization', `Bearer ${ownerToken}`)
        .send({});

      assert.strictEqual(res.status, 403);
      assert.strictEqual(res.body.success, false);
      assert.ok(res.body.message.includes('permission'));
    });

    test('DELETE /api/admin/users/:id fails when admin attempts to delete own account', async () => {
      const adminToken = signToken({
        id: 'logged-in-admin-id',
        email: 'admin@example.com',
        role: Role.ADMIN,
      });

      const res = await request(app)
        .delete('/api/admin/users/logged-in-admin-id')
        .set('Authorization', `Bearer ${adminToken}`);

      assert.strictEqual(res.status, 400);
      assert.strictEqual(res.body.success, false);
      assert.ok(res.body.message.includes('cannot delete your own admin account'));
    });
  });

  describe('Admin Reset Password Schema', () => {
    test('should accept empty body for auto-generated temporary password', () => {
      const result = adminResetUserPasswordSchema.safeParse({});
      assert.strictEqual(result.success, true);
    });

    test('should accept valid custom password', () => {
      const result = adminResetUserPasswordSchema.safeParse({
        password: 'ValidPass@123',
      });
      assert.strictEqual(result.success, true);
    });

    test('should reject invalid custom password not meeting complexity', () => {
      const result = adminResetUserPasswordSchema.safeParse({
        password: 'weak',
      });
      assert.strictEqual(result.success, false);
    });
  });


  describe('Admin User Creation Schema', () => {
    test('should reject user creation with name under 2 chars', () => {
      const result = adminCreateUserSchema.safeParse({
        name: 'A',
        email: 'newadmin@example.com',
        password: 'Password@123',
        role: Role.ADMIN,
      });
      assert.strictEqual(result.success, false);
    });

    test('should accept creating STORE_OWNER with valid credentials', () => {
      const result = adminCreateUserSchema.safeParse({
        name: 'Store Owner Representative Account',
        email: 'storeowner@example.com',
        password: 'Password@123',
        role: Role.STORE_OWNER,
        address: '123 Market Street, Commercial Zone',
      });
      assert.strictEqual(result.success, true);
    });
  });

  describe('Admin Store Creation Schema', () => {
    test('should reject store with name under 2 chars', () => {
      const result = adminCreateStoreSchema.safeParse({
        name: 'A',
        email: 'store@example.com',
        address: '123 Market St',
      });
      assert.strictEqual(result.success, false);
    });

    test('should accept valid store creation with short name (e.g. 2 chars or 11 chars)', () => {
      const result = adminCreateStoreSchema.safeParse({
        name: 'Short Store',
        email: 'store@example.com',
        address: '123 Market St',
      });
      assert.strictEqual(result.success, true);
    });

    test('should reject store name longer than 100 chars', () => {
      const result = adminCreateStoreSchema.safeParse({
        name: 'A'.repeat(101),
        email: 'store@example.com',
        address: '123 Market St',
      });
      assert.strictEqual(result.success, false);
    });

    test('should reject store address under 5 chars', () => {
      const result = adminCreateStoreSchema.safeParse({
        name: 'Valid Store',
        email: 'store@example.com',
        address: '123',
      });
      assert.strictEqual(result.success, false);
    });

    test('should accept valid store creation payload with business name and address', () => {
      const result = adminCreateStoreSchema.safeParse({
        name: "Trader Joe's & Co.",
        email: 'contact@superstore.com',
        address: '123 Tech Park Avenue, Suite #400, Central District',
        ownerId: '123e4567-e89b-12d3-a456-426614174000',
      });
      assert.strictEqual(result.success, true);
    });
  });

  describe('User Listing & Query Validation', () => {
    test('should parse valid query params and clamp limit', () => {
      const result = userListQuerySchema.safeParse({
        page: '2',
        limit: '150', // exceeds 100, should be clamped
        search: 'Alice',
        role: Role.USER,
        sortBy: 'name',
        sortOrder: 'asc',
      });

      assert.strictEqual(result.success, true);
      if (result.success) {
        assert.strictEqual(result.data.page, 2);
        assert.strictEqual(result.data.limit, 100);
        assert.strictEqual(result.data.search, 'Alice');
        assert.strictEqual(result.data.role, Role.USER);
        assert.strictEqual(result.data.sortBy, 'name');
        assert.strictEqual(result.data.sortOrder, 'asc');
      }
    });

    test('should reject invalid role in user list query', () => {
      const result = userListQuerySchema.safeParse({
        role: 'SUPERADMIN',
      });
      assert.strictEqual(result.success, false);
    });
  });
});
