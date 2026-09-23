import assert from 'node:assert/strict';
import test from 'node:test';
import { applyWorkflowEvent, initialWorkflowState } from './index.js';

test('advances the autonomous pipeline into the ready buffer', () => {
  let result = { state: initialWorkflowState('video-1'), applied: true };
  const events = [
    'MEDIA_INGESTED',
    'ANALYSIS_COMPLETED',
    'DUBBING_COMPLETED',
    'EDITING_COMPLETED',
    'CAPTIONS_COMPLETED',
    'RENDER_COMPLETED',
    'QC_PASSED',
  ] as const;

  for (const [index, type] of events.entries()) {
    result = applyWorkflowEvent(result.state, {
      idempotencyKey: `video-1:${type}`,
      sourceVideoId: 'video-1',
      type,
      occurredAt: new Date(index).toISOString(),
    });
  }

  assert.equal(result.state.status, 'READY');
  assert.equal(result.state.processedEventKeys.length, events.length);
});

test('ignores duplicate events by idempotency key', () => {
  const event = {
    idempotencyKey: 'video-1:media-ingested',
    sourceVideoId: 'video-1',
    type: 'MEDIA_INGESTED' as const,
    occurredAt: new Date().toISOString(),
  };
  const first = applyWorkflowEvent(initialWorkflowState('video-1'), event);
  const second = applyWorkflowEvent(first.state, event);

  assert.equal(second.applied, false);
  assert.deepEqual(second.state, first.state);
});

test('rejects out-of-order processing events', () => {
  assert.throws(
    () => applyWorkflowEvent(initialWorkflowState('video-1'), {
      idempotencyKey: 'video-1:qc-passed',
      sourceVideoId: 'video-1',
      type: 'QC_PASSED',
      occurredAt: new Date().toISOString(),
    }),
    /Cannot apply QC_PASSED while source video is QUEUED/,
  );
});

test('moves a ready video to published only after a publish completion event', () => {
  const ready = {
    ...initialWorkflowState('video-1'),
    status: 'READY' as const,
  };
  const requested = applyWorkflowEvent(ready, {
    idempotencyKey: 'video-1:publish-requested',
    sourceVideoId: 'video-1',
    type: 'PUBLISH_REQUESTED',
    occurredAt: new Date().toISOString(),
  });
  const published = applyWorkflowEvent(requested.state, {
    idempotencyKey: 'video-1:publish-completed',
    sourceVideoId: 'video-1',
    type: 'PUBLISH_COMPLETED',
    occurredAt: new Date().toISOString(),
  });

  assert.equal(requested.state.status, 'READY');
  assert.equal(published.state.status, 'PUBLISHED');
});
