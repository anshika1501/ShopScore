import { test, describe } from 'node:test';
import assert from 'node:assert/strict';
import request from 'supertest';
import app from '../src/app';

describe('API Foundation & Health', () => {
  test('GET /api/health returns 200 OK', async () => {
    const res = await request(app).get('/api/health');
    assert.strictEqual(res.status, 200);
    assert.strictEqual(res.body.status, 'ok');
    assert.ok(res.body.timestamp);
  });

  test('GET /api/nonexistent-endpoint returns 404 with standard error shape', async () => {
    const res = await request(app).get('/api/nonexistent-endpoint');
    assert.strictEqual(res.status, 404);
    assert.strictEqual(res.body.success, false);
    assert.ok(res.body.message.includes('not found'));
  });

  test('POST /api/auth/register with invalid data returns 400 with field details', async () => {
    const res = await request(app).post('/api/auth/register').send({
      name: 'Short',
      email: 'not-an-email',
      password: 'weak',
    });

    assert.strictEqual(res.status, 400);
    assert.strictEqual(res.body.success, false);
    assert.ok(res.body.details);
    assert.ok(res.body.details.name);
    assert.ok(res.body.details.email);
    assert.ok(res.body.details.password);
  });
});
