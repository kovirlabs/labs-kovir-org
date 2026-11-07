// npm run catalog — list public kovirlabs repos that have no project file. Always exits 0.
import { readFileSync } from 'node:fs';
import { INFRA_REPOS, uncataloged } from '../src/lib/catalog.ts';
import { readCuratedRepos } from '../src/lib/curated-repos.ts';
import type { Snapshot } from '../src/lib/types.ts';
import { SNAPSHOT_FILE, readProjectFiles } from './read-projects.ts';

const snapshot = JSON.parse(readFileSync(SNAPSHOT_FILE, 'utf8')) as Snapshot;
const missing = uncataloged(
  snapshot.publicRepos.map((r) => r.fullName),
  readCuratedRepos(readProjectFiles()),
  INFRA_REPOS,
);
console.log(missing.length ? `uncataloged public repos: ${missing.join(', ')}` : 'catalog complete');
