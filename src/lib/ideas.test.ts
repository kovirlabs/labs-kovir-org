import { test } from 'node:test';
import assert from 'node:assert/strict';
import { groupIdeas, ideaStatus, toIdeaViews, topIdeas } from './ideas.ts';
import type { IdeaFacts } from './types.ts';

let n = 0;
const idea = (over: Partial<IdeaFacts> = {}): IdeaFacts => ({
  number: ++n,
  title: `Idea ${n}`,
  url: `https://github.com/kovirlabs/community/discussions/${n}`,
  category: 'Ideas',
  labels: [],
  upvotes: 0,
  comments: 0,
  createdAt: '2026-10-01T00:00:00Z',
  updatedAt: '2026-10-01T00:00:00Z',
  closed: false,
  ...over,
});

test('ideaStatus: the most advanced status label wins', () => {
  assert.equal(ideaStatus(['status: accepted', 'status: shipped']), 'shipped');
  assert.equal(ideaStatus(['status: not-now', 'status: in-progress']), 'in-progress');
  assert.equal(ideaStatus(['status: under-review', 'status: not-now']), 'not-now');
});

test('ideaStatus/toIdeaViews: unknown labels → null, and open ideas default to under-review (Review Focus 2)', () => {
  assert.equal(ideaStatus(['status: maybe', 'bug']), null);
  const [v] = toIdeaViews([idea({ labels: ['status: maybe', 'bug'] })]);
  assert.equal(v.status, 'under-review');
});

test('toIdeaViews: closed with no status label is hidden; closed not-now is kept (Review Focus 4)', () => {
  const views = toIdeaViews([
    idea({ title: 'spam', closed: true }),
    idea({ title: 'declined', closed: true, labels: ['status: not-now'] }),
  ]);
  assert.deepEqual(views.map((v) => [v.title, v.status]), [['declined', 'not-now']]);
});

test('toIdeaViews: only the Ideas category; fromForm from the source label', () => {
  const views = toIdeaViews([
    idea({ title: 'question', category: 'Q&A' }),
    idea({ title: 'from form', labels: ['source: form'] }),
  ]);
  assert.deepEqual(views.map((v) => [v.title, v.fromForm]), [['from form', true]]);
});

test('toIdeaViews: sorted by upvotes, then most recently updated', () => {
  const views = toIdeaViews([
    idea({ title: 'a', upvotes: 3, updatedAt: '2026-10-01T00:00:00Z' }),
    idea({ title: 'b', upvotes: 9, updatedAt: '2026-10-02T00:00:00Z' }),
    idea({ title: 'c', upvotes: 9, updatedAt: '2026-10-05T00:00:00Z' }),
  ]);
  assert.deepEqual(views.map((v) => v.title), ['c', 'b', 'a']);
});

test('groupIdeas: accepted and in-progress are active', () => {
  const g = groupIdeas(
    toIdeaViews([
      idea({ title: 'acc', labels: ['status: accepted'] }),
      idea({ title: 'prog', labels: ['status: in-progress'] }),
      idea({ title: 'new' }),
      idea({ title: 'done', closed: true, labels: ['status: shipped'] }),
      idea({ title: 'no', closed: true, labels: ['status: not-now'] }),
    ]),
  );
  assert.deepEqual(g.active.map((v) => v.title).sort(), ['acc', 'prog']);
  assert.deepEqual(g.underReview.map((v) => v.title), ['new']);
  assert.deepEqual(g.shipped.map((v) => v.title), ['done']);
  assert.deepEqual(g.notNow.map((v) => v.title), ['no']);
});

test('topIdeas: open statuses only, at most n', () => {
  const views = toIdeaViews([
    idea({ title: 'shipped', upvotes: 50, labels: ['status: shipped'] }),
    idea({ title: 'declined', upvotes: 40, labels: ['status: not-now'] }),
    idea({ title: 'one', upvotes: 5 }),
    idea({ title: 'two', upvotes: 4, labels: ['status: accepted'] }),
    idea({ title: 'three', upvotes: 3, labels: ['status: in-progress'] }),
    idea({ title: 'four', upvotes: 2 }),
  ]);
  assert.deepEqual(topIdeas(views, 3).map((v) => v.title), ['one', 'two', 'three']);
});

test('toIdeaViews: closed with only the auto-applied under-review label is hidden (review finding 1)', () => {
  const views = toIdeaViews([idea({ title: 'dup', closed: true, labels: ['status: under-review'] })]);
  assert.deepEqual(views, []);
});
