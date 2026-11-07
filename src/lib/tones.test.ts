import { test } from 'node:test';
import assert from 'node:assert/strict';
import { ideaTone, releaseLine, supportTone } from './tones.ts';

test('supportTone: each support level has a TagBrush tone and its label', () => {
  assert.deepEqual(supportTone('official'), { tone: 'success', label: 'Officially supported' });
  assert.deepEqual(supportTone('incubating'), { tone: 'info', label: 'Incubating' });
  assert.deepEqual(supportTone('lab'), { tone: 'neutral', label: 'From the lab' });
});

test('ideaTone: each idea status has a TagBrush tone and its label', () => {
  assert.deepEqual(ideaTone('under-review'), { tone: 'info', label: 'Under review' });
  assert.deepEqual(ideaTone('accepted'), { tone: 'success', label: 'Accepted' });
  assert.deepEqual(ideaTone('in-progress'), { tone: 'warning', label: 'In progress' });
  assert.deepEqual(ideaTone('shipped'), { tone: 'success', label: 'Shipped' });
  assert.deepEqual(ideaTone('not-now'), { tone: 'neutral', label: 'Not now' });
});

test('releaseLine: no release yet is null', () => {
  assert.equal(releaseLine(null), null);
});

test('releaseLine: tag, display date and machine date', () => {
  assert.deepEqual(releaseLine({ tag: 'v1.2.0', publishedAt: '2026-11-01T12:00:00Z' }), {
    tag: 'v1.2.0',
    date: '1 Nov 2026',
    iso: '2026-11-01T12:00:00Z',
  });
});
