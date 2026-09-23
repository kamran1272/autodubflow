import assert from 'node:assert/strict';
import test from 'node:test';

import { auth } from './config';
import { requireAuth } from './middleware';
import { enforceOwnership } from './ownership';

test('requireAuth rejects unauthenticated requests', async () => {
  const req = { headers: {} } as any;
  const res = {
    status(code: number) {
      this.statusCode = code;
      return this;
    },
    json(payload: unknown) {
      this.payload = payload;
      return this;
    },
  } as any;

  let nextCalled = false;
  await requireAuth(req, res, () => {
    nextCalled = true;
  });

  assert.equal(res.statusCode, 401);
  assert.equal(nextCalled, false);
  assert.deepEqual(res.payload, { error: 'Authentication required.' });
});

test('requireAuth attaches user and continues for a valid session', async () => {
  const originalGetSession = auth.api.getSession;
  auth.api.getSession = (async () => ({
    user: {
      id: 'user_123',
      email: 'user@example.com',
      name: 'Test User',
    },
  }) as any) as any;

  const req = { headers: { cookie: 'adf_session=test' } } as any;
  const res = { status: () => res, json: () => res } as any;
  let nextCalled = false;

  await requireAuth(req, res, () => {
    nextCalled = true;
  });

  assert.equal(nextCalled, true);
  assert.equal(req.user?.id, 'user_123');

  auth.api.getSession = originalGetSession;
});

test('enforceOwnership blocks cross-user access', () => {
  const result = enforceOwnership({
    ownerId: 'owner_1',
    userId: 'owner_2',
  });

  assert.equal(result.allowed, false);
  assert.equal(result.reason, 'forbidden');
});

test('enforceOwnership allows the resource owner', () => {
  const result = enforceOwnership({
    ownerId: 'owner_1',
    userId: 'owner_1',
  });

  assert.equal(result.allowed, true);
  assert.equal(result.reason, 'authorized');
});
