import { test } from 'node:test';
import assert from 'node:assert/strict';
import { readCuratedRepos } from './curated-repos.ts';

test('readCuratedRepos: reads repo from frontmatter only, quoted or not, sorted and unique', () => {
  const files = [
    { name: 'toril.md', text: '---\nname: Toril\nrepo: kovirlabs/toril\n---\n\nBody text\nrepo: fake/x\n' },
    { name: 'nu.md', text: '---\nrepo: "kovirlabs/nu"\nname: Nu\n---\nBody\n' },
    { name: 'dup.md', text: "---\nrepo: 'kovirlabs/toril'\n---\n" },
    { name: 'none.md', text: 'no frontmatter\nrepo: fake/y\n' },
  ];
  assert.deepEqual(readCuratedRepos(files), ['kovirlabs/nu', 'kovirlabs/toril']);
});
