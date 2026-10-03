import { test, describe } from 'node:test';
import assert from 'node:assert/strict';
import { registerSchema, loginSchema, changePasswordSchema } from '../src/validators/auth.validator';

describe('Auth Validation Schemas', () => {
  describe('Name Validation (20-60 characters inclusive)', () => {
    test('should reject names shorter than 20 characters', () => {
      const result = registerSchema.safeParse({
        name: 'Short Name',
        email: 'test@example.com',
        password: 'ValidPassword@123',
      });
      assert.strictEqual(result.success, false);
      if (!result.success) {
        assert.ok(result.error.errors.some((e) => e.path.includes('name')));
      }
    });

    test('should accept names between 20 and 60 characters', () => {
      const result = registerSchema.safeParse({
        name: 'This Is A Valid Twenty Chars Name',
        email: 'test@example.com',
        password: 'ValidPass@123',
      });
      assert.strictEqual(result.success, true);
    });

    test('should reject names longer than 60 characters', () => {
      const longName = 'A'.repeat(61);
      const result = registerSchema.safeParse({
        name: longName,
        email: 'test@example.com',
        password: 'ValidPassword@123',
      });
      assert.strictEqual(result.success, false);
      if (!result.success) {
        assert.ok(result.error.errors.some((e) => e.path.includes('name')));
      }
    });
  });

  describe('Password Validation (8-16 chars, >=1 uppercase, >=1 special char)', () => {
    test('should reject passwords shorter than 8 characters', () => {
      const result = registerSchema.safeParse({
        name: 'Valid Name Exactly Twenty Two Chars',
        email: 'test@example.com',
        password: 'P@1',
      });
      assert.strictEqual(result.success, false);
    });

    test('should reject passwords longer than 16 characters', () => {
      const result = registerSchema.safeParse({
        name: 'Valid Name Exactly Twenty Two Chars',
        email: 'test@example.com',
        password: 'VeryLongPassword@123456789',
      });
      assert.strictEqual(result.success, false);
    });

    test('should reject passwords without an uppercase character', () => {
      const result = registerSchema.safeParse({
        name: 'Valid Name Exactly Twenty Two Chars',
        email: 'test@example.com',
        password: 'password@123',
      });
      assert.strictEqual(result.success, false);
    });

    test('should reject passwords without a special character', () => {
      const result = registerSchema.safeParse({
        name: 'Valid Name Exactly Twenty Two Chars',
        email: 'test@example.com',
        password: 'Password123',
      });
      assert.strictEqual(result.success, false);
    });

    test('should accept valid passwords meeting all criteria', () => {
      const result = registerSchema.safeParse({
        name: 'Valid Name Exactly Twenty Two Chars',
        email: 'test@example.com',
        password: 'SecurePassword@1',
      });
      assert.strictEqual(result.success, true);
    });
  });

  describe('Address Validation (max 400 chars)', () => {
    test('should reject address exceeding 400 characters', () => {
      const result = registerSchema.safeParse({
        name: 'Valid Name Exactly Twenty Two Chars',
        email: 'test@example.com',
        password: 'SecurePassword@1',
        address: 'x'.repeat(401),
      });
      assert.strictEqual(result.success, false);
    });

    test('should accept valid address up to 400 characters', () => {
      const result = registerSchema.safeParse({
        name: 'Valid Name Exactly Twenty Two Chars',
        email: 'test@example.com',
        password: 'SecurePassword@1',
        address: '123 Main Street, Suite 500, Tech City',
      });
      assert.strictEqual(result.success, true);
    });
  });

  describe('Email Validation', () => {
    test('should reject invalid email formats', () => {
      const result = registerSchema.safeParse({
        name: 'Valid Name Exactly Twenty Two Chars',
        email: 'not-an-email',
        password: 'SecurePassword@1',
      });
      assert.strictEqual(result.success, false);
    });

    test('should trim and lowercase email', () => {
      const result = loginSchema.safeParse({
        email: '  JOHN.DOE@EXAMPLE.COM  ',
        password: 'anypassword',
      });
      assert.strictEqual(result.success, true);
      if (result.success) {
        assert.strictEqual(result.data.email, 'john.doe@example.com');
      }
    });
  });
});
