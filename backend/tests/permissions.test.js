import test from 'node:test';
import assert from 'node:assert/strict';
import { requireAdmin, requireVerified } from '../src/middlewares/auth.middleware.js';

test('Permissions: requireAdmin blocks non-admin users with 403', () => {
  const req = { user: { role: 'student', id: 5 } };
  const res = {};
  let capturedError = null;
  const next = (err) => { capturedError = err; };

  requireAdmin(req, res, next);
  assert.ok(capturedError);
  assert.strictEqual(capturedError.statusCode, 403);
});

test('Permissions: requireAdmin allows admin user', () => {
  const req = { user: { role: 'admin', id: 1 } };
  const res = {};
  let calledNext = false;
  const next = (err) => { if (!err) calledNext = true; };

  requireAdmin(req, res, next);
  assert.strictEqual(calledNext, true);
});

test('Permissions: requireVerified blocks unverified students', () => {
  const req = { user: { role: 'student', is_verified: false, id: 2 } };
  const res = {};
  let capturedError = null;
  const next = (err) => { capturedError = err; };

  requireVerified(req, res, next);
  assert.ok(capturedError);
  assert.strictEqual(capturedError.statusCode, 403);
});

test('Permissions: requireVerified permits verified students', () => {
  const req = { user: { role: 'student', is_verified: true, id: 2 } };
  const res = {};
  let calledNext = false;
  const next = (err) => { if (!err) calledNext = true; };

  requireVerified(req, res, next);
  assert.strictEqual(calledNext, true);
});
