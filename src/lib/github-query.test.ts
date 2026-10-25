import { test } from 'node:test';
import assert from 'node:assert/strict';
import { readFileSync } from 'node:fs';
import { buildQuery, normalize } from './github-query.ts';

const fixture = (name: string): unknown =>
  JSON.parse(readFileSync(new URL(`./__fixtures__/${name}.json`, import.meta.url), 'utf8'));

test('buildQuery: one aliased repository block per curated repo, plus forum and org', () => {
  const { query, aliases } = buildQuery(['kovirlabs/toril', 'kovirlabs/nu']);
  assert.deepEqual(aliases, { r0: 'kovirlabs/toril', r1: 'kovirlabs/nu' });
  assert.ok(query.includes('r1: repository(owner: "kovirlabs", name: "nu")'));
  assert.ok(query.includes('forum: repository(owner: "kovirlabs", name: "community")'));
  assert.ok(query.includes('org: organization(login: "kovirlabs")'));
});

test('buildQuery: rejects repo names that could inject into the query', () => {
  assert.throws(() => buildQuery(['kovirlabs/toril") { id } x: repository(owner: "a']));
  assert.throws(() => buildQuery(['no-slash']));
});

test('normalize: maps repo facts', () => {
  const { aliases } = buildQuery(['kovirlabs/toril', 'kovirlabs/nu']);
  const n = normalize(fixture('graphql-ok'), aliases);
  const toril = n.repos['kovirlabs/toril'];
  assert.equal(toril.stars, 7);
  assert.equal(toril.license, 'Apache-2.0');
  assert.ok(toril.topics.includes('markdown-editor'));
  assert.equal(toril.latestRelease?.tag, 'v1.1.1');
  assert.equal(toril.latestRelease?.assets.length, 17);
  assert.equal(typeof toril.latestRelease?.assets[0].url, 'string');
  assert.equal(toril.hasContributing, true);
  const nu = n.repos['kovirlabs/nu'];
  assert.equal(nu.latestRelease, null);
  assert.equal(nu.license, 'GPL-3.0');
  assert.deepEqual(n.missing, []);
  assert.deepEqual(n.failed, []);
});

test('normalize: maps discussions and drops archived public repos', () => {
  const { aliases } = buildQuery(['kovirlabs/toril', 'kovirlabs/nu']);
  const n = normalize(fixture('graphql-ok'), aliases);
  assert.equal(n.ideas?.length, 4);
  const first = n.ideas![0];
  assert.deepEqual(first.labels, ['status: under-review', 'source: form']);
  assert.equal(first.category, 'Ideas');
  assert.equal(first.upvotes, 9);
  assert.equal(first.comments, 3);
  assert.deepEqual(n.publicRepos, ['kovirlabs/toril', 'kovirlabs/nu']);
});

test('normalize: partial results sort NOT_FOUND into missing, other errors into failed', () => {
  const aliases = { r0: 'kovirlabs/toril', r1: 'kovirlabs/nu', r2: 'kovirlabs/x' };
  const n = normalize(fixture('graphql-partial'), aliases);
  assert.deepEqual(n.missing, ['kovirlabs/nu']);
  assert.deepEqual(n.failed, ['kovirlabs/x']);
  assert.equal(n.ideas, null);
  assert.ok(n.repos['kovirlabs/toril']);
});
