import { test, describe } from 'node:test';
import assert from 'node:assert/strict';
import { Role } from '@prisma/client';
import { signToken, verifyToken } from '../src/utils/jwt';

describe('JWT Utilities', () => {
  test('should sign and verify valid payload', () => {
    const payload = {
      id: 'test-user-id-1234',
      email: 'test@example.com',
      role: Role.USER,
    };

    const token = signToken(payload);
    assert.ok(typeof token === 'string');

    const decoded = verifyToken(token);
    assert.strictEqual(decoded.id, payload.id);
    assert.strictEqual(decoded.email, payload.email);
    assert.strictEqual(decoded.role, payload.role);
  });

  test('should fail when verifying malformed token', () => {
    assert.throws(() => {
      verifyToken('invalid.token.payload');
    });
  });
});
