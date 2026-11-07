import { test } from 'node:test';
import assert from 'node:assert/strict';
import { matches } from './project-filter.ts';

const item = { category: 'desktop-app', platforms: ['windows', 'linux'] };

test('matches: platform filter', () => {
  assert.equal(matches(item, { category: null, platform: 'windows' }), true);
  assert.equal(matches(item, { category: null, platform: 'macos' }), false);
});

test('matches: category filter', () => {
  assert.equal(matches(item, { category: 'library', platform: null }), false);
  assert.equal(matches(item, { category: 'desktop-app', platform: 'linux' }), true);
});

test('matches: no filters shows everything', () => {
  assert.equal(matches(item, { category: null, platform: null }), true);
});
