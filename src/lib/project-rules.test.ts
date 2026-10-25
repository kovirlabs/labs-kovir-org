import { test } from 'node:test';
import assert from 'node:assert/strict';
import { projectRuleErrors } from './project-rules.ts';

test('projectRuleErrors: featured requires official', () => {
  assert.deepEqual(projectRuleErrors({ support: 'lab', featured: true }), [
    'featured requires support: official',
  ]);
});

test('projectRuleErrors: official requires supportedSince', () => {
  assert.deepEqual(projectRuleErrors({ support: 'official', featured: false }), [
    'support: official requires supportedSince',
  ]);
});

test('projectRuleErrors: a complete official, featured project is valid', () => {
  assert.deepEqual(
    projectRuleErrors({ support: 'official', featured: true, supportedSince: new Date('2026-11-01') }),
    [],
  );
});
