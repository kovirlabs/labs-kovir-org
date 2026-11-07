import { test } from 'node:test';
import assert from 'node:assert/strict';
import { formatUpdated, loadSnapshot } from './snapshot.ts';

test('formatUpdated: UTC day month year, or null', () => {
  assert.equal(formatUpdated('2026-10-25T06:00:00Z'), '25 Oct 2026');
  assert.equal(formatUpdated('2026-10-25T23:59:00-05:00'), '26 Oct 2026');
  assert.equal(formatUpdated(null), null);
});

test('loadSnapshot: returns the committed snapshot shape', () => {
  const s = loadSnapshot();
  assert.equal(typeof s.repos, 'object');
  assert.ok(Array.isArray(s.ideas));
  assert.ok(Array.isArray(s.publicRepos));
});
