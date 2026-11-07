import { test } from 'node:test';
import assert from 'node:assert/strict';
import { toRepoRows } from './all-repos.ts';
import type { PublicRepo } from './types.ts';

const repo = (name: string, pushedAt: string, extra: Partial<PublicRepo> = {}): PublicRepo => ({
  fullName: `kovirlabs/${name}`,
  url: `https://github.com/kovirlabs/${name}`,
  description: `${name} description`,
  language: 'Python',
  pushedAt,
  fork: false,
  ...extra,
});

const repos = [
  repo('old', '2025-01-02T00:00:00Z'),
  repo('toril', '2026-11-01T00:00:00Z', { language: 'TypeScript' }),
  repo('community', '2026-11-05T00:00:00Z'),
  repo('nu', '2026-10-01T00:00:00Z', { fork: true }),
];

test('toRepoRows: newest push first, infrastructure repos left out, forks kept', () => {
  const rows = toRepoRows(repos, {}, ['kovirlabs/community']);
  assert.deepEqual(
    rows.map((r) => r.name),
    ['toril', 'nu', 'old'],
  );
  assert.equal(rows.find((r) => r.name === 'nu')?.fork, true);
});

test('toRepoRows: curated repos link to their project page, the rest are unreviewed', () => {
  const rows = toRepoRows(repos, { 'kovirlabs/toril': 'toril' }, []);
  assert.equal(rows.find((r) => r.name === 'toril')?.projectHref, '/projects/toril');
  assert.equal(rows.find((r) => r.name === 'old')?.projectHref, null);
});

test('toRepoRows: carries display fields and formats the update date', () => {
  const [row] = toRepoRows([repo('toril', '2026-11-01T12:00:00Z', { language: 'TypeScript' })], {}, []);
  assert.deepEqual(row, {
    name: 'toril',
    url: 'https://github.com/kovirlabs/toril',
    description: 'toril description',
    language: 'TypeScript',
    updated: '1 Nov 2026',
    updatedIso: '2026-11-01T12:00:00Z',
    fork: false,
    projectHref: null,
  });
});

test('toRepoRows: missing description and language stay null', () => {
  const [row] = toRepoRows([repo('bare', '2026-01-01T00:00:00Z', { description: null, language: null })], {}, []);
  assert.equal(row.description, null);
  assert.equal(row.language, null);
});

test('toRepoRows: blank descriptions count as missing', () => {
  const [row] = toRepoRows([repo('blank', '2026-01-01T00:00:00Z', { description: '   ' })], {}, []);
  assert.equal(row.description, null);
});
