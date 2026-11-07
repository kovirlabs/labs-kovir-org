import { test } from 'node:test';
import assert from 'node:assert/strict';
import { INFRA_REPOS, uncataloged } from './catalog.ts';

test('INFRA_REPOS: the site, forum and org profile repos are infrastructure, not projects', () => {
  assert.deepEqual(INFRA_REPOS, ['kovirlabs/labs-kovir-org', 'kovirlabs/community', 'kovirlabs/.github']);
});

test('uncataloged: public repos with no project file, minus ignored ones', () => {
  assert.deepEqual(
    uncataloged(['kovirlabs/a', 'kovirlabs/b', 'kovirlabs/community'], ['kovirlabs/a'], ['kovirlabs/community']),
    ['kovirlabs/b'],
  );
});
