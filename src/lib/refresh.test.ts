import { test } from 'node:test';
import assert from 'node:assert/strict';
import { readFileSync } from 'node:fs';
import { refresh } from './refresh.ts';
import type { RepoFacts, Snapshot } from './types.ts';

const fixture = (name: string): unknown =>
  JSON.parse(readFileSync(new URL(`./__fixtures__/${name}.json`, import.meta.url), 'utf8'));

const respond = (body: unknown, status = 200): typeof fetch =>
  (async () => new Response(JSON.stringify(body), { status })) as typeof fetch;

const NOW = new Date('2026-10-25T06:00:00Z');
const previousFacts = { fullName: 'kovirlabs/x', stars: 1 } as RepoFacts;
const previous: Snapshot = {
  fetchedAt: '2026-10-24T06:00:00Z',
  repos: { 'kovirlabs/nu': previousFacts },
  ideas: [{ number: 1, title: 'old idea' } as Snapshot['ideas'][number]],
  publicRepos: ['kovirlabs/nu'],
};
const base = { previous, now: () => NOW };

test('refresh: no token → fallback', async () => {
  const r = await refresh({ ...base, token: undefined, repos: ['kovirlabs/toril'], fetchImpl: respond({}) });
  assert.deepEqual(r, { kind: 'fallback', reason: 'no GITHUB_TOKEN' });
});

test('refresh: network error → fallback', async () => {
  const boom = (async () => {
    throw new Error('ECONNRESET');
  }) as typeof fetch;
  const r = await refresh({ ...base, token: 't', repos: ['kovirlabs/toril'], fetchImpl: boom });
  assert.equal(r.kind, 'fallback');
});

test('refresh: HTTP 502 → fallback', async () => {
  const r = await refresh({ ...base, token: 't', repos: ['kovirlabs/toril'], fetchImpl: respond({ message: 'bad gateway' }, 502) });
  assert.equal(r.kind, 'fallback');
});

test('refresh: body without data (e.g. bad credentials) → fallback', async () => {
  const r = await refresh({ ...base, token: 't', repos: ['kovirlabs/toril'], fetchImpl: respond({ message: 'Bad credentials' }) });
  assert.equal(r.kind, 'fallback');
});

test('refresh: full success → ok snapshot stamped with now()', async () => {
  const r = await refresh({ ...base, token: 't', repos: ['kovirlabs/toril', 'kovirlabs/nu'], fetchImpl: respond(fixture('graphql-ok')) });
  assert.equal(r.kind, 'ok');
  if (r.kind !== 'ok') return;
  assert.equal(r.snapshot.fetchedAt, '2026-10-25T06:00:00.000Z');
  assert.equal(r.snapshot.repos['kovirlabs/toril'].stars, 7);
  assert.equal(r.snapshot.ideas.length, 4);
  assert.deepEqual(r.warnings, []);
});

test('refresh: a curated repo GitHub cannot find → missing', async () => {
  const r = await refresh({
    ...base,
    token: 't',
    repos: ['kovirlabs/toril', 'kovirlabs/nu', 'kovirlabs/x'],
    fetchImpl: respond(fixture('graphql-partial')),
  });
  assert.deepEqual(r, { kind: 'missing', repos: ['kovirlabs/nu'] });
});

test('refresh: a repo that errors otherwise keeps its previous facts, and lost ideas keep the previous ideas', async () => {
  const body = {
    data: { r0: null, forum: null, org: null },
    errors: [{ type: 'FORBIDDEN', path: ['r0'] }],
  };
  const r = await refresh({ ...base, token: 't', repos: ['kovirlabs/nu'], fetchImpl: respond(body) });
  assert.equal(r.kind, 'ok');
  if (r.kind !== 'ok') return;
  assert.equal(r.snapshot.repos['kovirlabs/nu'], previousFacts);
  assert.deepEqual(r.snapshot.ideas, previous.ideas);
  assert.deepEqual(r.snapshot.publicRepos, previous.publicRepos);
  assert.ok(r.warnings.some((w) => w.includes('kovirlabs/nu')));
});

test('refresh: sends a bearer token to the GraphQL endpoint', async () => {
  let seen: { url: string; auth: string | null } | undefined;
  const spy = (async (url: string, init: RequestInit) => {
    seen = { url, auth: new Headers(init.headers).get('authorization') };
    return new Response(JSON.stringify(fixture('graphql-ok')));
  }) as unknown as typeof fetch;
  await refresh({ ...base, token: 'abc', repos: ['kovirlabs/toril', 'kovirlabs/nu'], fetchImpl: spy });
  assert.deepEqual(seen, { url: 'https://api.github.com/graphql', auth: 'bearer abc' });
});
