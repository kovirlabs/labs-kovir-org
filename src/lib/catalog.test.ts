import { test } from 'node:test';
import assert from 'node:assert/strict';
import { uncataloged } from './catalog.ts';

test('uncataloged: public repos with no project file, minus ignored ones', () => {
  assert.deepEqual(
    uncataloged(['kovirlabs/a', 'kovirlabs/b', 'kovirlabs/community'], ['kovirlabs/a'], ['kovirlabs/community']),
    ['kovirlabs/b'],
  );
});
