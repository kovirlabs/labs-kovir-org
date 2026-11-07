import { test } from 'node:test';
import assert from 'node:assert/strict';
import { readFileSync } from 'node:fs';
import { buildQuery, normalize } from './github-query.ts';
import { groupBySupport, sortProjects, toProjectView, type ProjectEntry, type ProjectView } from './projects.ts';
import type { RepoFacts } from './types.ts';

const ok = JSON.parse(readFileSync(new URL('./__fixtures__/graphql-ok.json', import.meta.url), 'utf8'));
const facts = normalize(ok, buildQuery(['kovirlabs/toril', 'kovirlabs/nu']).aliases).repos;

const entry = (over: Partial<ProjectEntry> = {}): ProjectEntry => ({
  slug: 'toril',
  name: 'Toril',
  repo: 'kovirlabs/toril',
  tagline: 'A markdown editor',
  audience: 'Writers',
  support: 'lab',
  status: 'stable',
  featured: false,
  order: 10,
  category: 'desktop-app',
  platforms: ['windows'],
  ideas: [],
  ...over,
});

test('toProjectView: a release with installers → download action', () => {
  const v = toProjectView(entry({ website: 'https://toril.ink/' }), facts['kovirlabs/toril']);
  assert.equal(v.primaryAction.kind, 'download');
  assert.equal(v.stars, 7);
  assert.equal(v.release?.tag, 'v1.1.1');
  assert.equal(v.downloads.length, 7);
  assert.equal(v.community?.contributing, true);
});

test('toProjectView: no release but a website → website action', () => {
  const v = toProjectView(
    entry({ slug: 'nu', name: 'Nu', repo: 'kovirlabs/nu', website: 'https://nu.example/' }),
    facts['kovirlabs/nu'],
  );
  assert.equal(v.primaryAction.kind, 'website');
  assert.equal(v.primaryAction.url, 'https://nu.example/');
});

test('toProjectView: no release and no website → repo action', () => {
  const v = toProjectView(entry({ slug: 'nu', name: 'Nu', repo: 'kovirlabs/nu' }), facts['kovirlabs/nu']);
  assert.deepEqual(v.primaryAction, { kind: 'repo', url: 'https://github.com/kovirlabs/nu', label: 'View on GitHub' });
});

test('toProjectView: an archived repo overrides the curated status', () => {
  const archived: RepoFacts = { ...facts['kovirlabs/toril'], archived: true };
  assert.equal(toProjectView(entry({ status: 'stable' }), archived).status, 'archived');
});

test('toProjectView: no snapshot data yet still renders (Review Focus 3)', () => {
  const v = toProjectView(entry({ repo: 'kovirlabs/new-thing' }), undefined);
  assert.equal(v.stars, null);
  assert.equal(v.release, null);
  assert.equal(v.license, null);
  assert.deepEqual(v.downloads, []);
  assert.equal(v.community, null);
  assert.equal(v.repoUrl, 'https://github.com/kovirlabs/new-thing');
  assert.equal(v.primaryAction.kind, 'repo');
});

const view = (over: Partial<ProjectEntry>): ProjectView => toProjectView(entry(over), undefined);

test('sortProjects: by order, then name', () => {
  const sorted = sortProjects([view({ name: 'B', order: 2 }), view({ name: 'Z', order: 1 }), view({ name: 'A', order: 2 })]);
  assert.deepEqual(sorted.map((v) => v.name), ['Z', 'A', 'B']);
});

test('groupBySupport: featured holds only official + featured', () => {
  const g = groupBySupport([
    view({ name: 'Off', support: 'official', featured: true, supportedSince: new Date('2026-11-01') }),
    view({ name: 'Off2', support: 'official', featured: false, supportedSince: new Date('2026-11-01') }),
    view({ name: 'Inc', support: 'incubating' }),
    view({ name: 'Lab', support: 'lab', featured: true }),
  ]);
  assert.deepEqual(g.featured.map((v) => v.name), ['Off']);
  assert.deepEqual(g.official.map((v) => v.name), ['Off', 'Off2']);
  assert.deepEqual(g.incubating.map((v) => v.name), ['Inc']);
  assert.deepEqual(g.lab.map((v) => v.name), ['Lab']);
});

test('groupBySupport: zero official projects → empty featured and official', () => {
  const g = groupBySupport([view({ name: 'Lab' })]);
  assert.deepEqual(g.featured, []);
  assert.deepEqual(g.official, []);
});
