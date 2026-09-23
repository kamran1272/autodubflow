import assert from 'node:assert/strict';
import test from 'node:test';

import { enforceOwnership } from '../../apps/api/src/auth/ownership';


test('ownership helper rejects unauthorized access for mismatched user ids', () => {
  const result = enforceOwnership({ ownerId: 'automation_1', userId: 'automation_2' });

  assert.equal(result.allowed, false);
  assert.equal(result.reason, 'forbidden');
});

test('ownership helper accepts matching user ids', () => {
  const result = enforceOwnership({ ownerId: 'automation_1', userId: 'automation_1' });

  assert.equal(result.allowed, true);
  assert.equal(result.reason, 'authorized');
});

test('ownership helper rejects missing current user', () => {
  const result = enforceOwnership({ ownerId: 'automation_1', userId: undefined });

  assert.equal(result.allowed, false);
  assert.equal(result.reason, 'unauthorized');
});
