import { test } from 'node:test';
import assert from 'node:assert/strict';
import { prefill } from './contact-prefill.ts';

test('prefill: type and known project', () => {
  assert.deepEqual(prefill('?type=idea&project=toril', ['toril']), { type: 'idea', project: 'toril' });
});

test('prefill: unknown project is dropped, valid type kept (Review Focus 5)', () => {
  assert.deepEqual(prefill('?type=idea&project=not-a-project', ['toril']), { type: 'idea' });
});

test('prefill: unknown type is dropped', () => {
  assert.deepEqual(prefill('?type=hack', []), {});
});

test('prefill: empty query', () => {
  assert.deepEqual(prefill('', []), {});
});

test('prefill: project alone is allowed', () => {
  assert.deepEqual(prefill('?project=nu', ['toril', 'nu']), { project: 'nu' });
});
