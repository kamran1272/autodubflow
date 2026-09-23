import assert from 'node:assert/strict';
import test from 'node:test';
import { getOutputPreset, outputPresets } from './output-presets.js';

test('defines platform-specific output geometry and safe areas', () => {
  assert.equal(outputPresets['youtube-shorts'].aspectRatio, '9:16');
  assert.equal(outputPresets['youtube-long-form'].aspectRatio, '16:9');
  assert.notDeepEqual(outputPresets['youtube-shorts'].safeArea, outputPresets['tiktok-vertical'].safeArea);
});

test('does not pretend custom output has a built-in encoding profile', () => {
  assert.equal(getOutputPreset('custom'), undefined);
});
