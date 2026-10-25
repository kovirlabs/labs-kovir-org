// npm run refresh — pull GitHub data into src/data/github-snapshot.json.
// No token or GitHub down: keep the committed snapshot (exit 0). A curated repo that no longer
// exists: exit 1, because listing it would be wrong.
import { readFileSync, writeFileSync } from 'node:fs';
import { readCuratedRepos } from '../src/lib/curated-repos.ts';
import { refresh } from '../src/lib/refresh.ts';
import type { Snapshot } from '../src/lib/types.ts';
import { SNAPSHOT_FILE, readProjectFiles } from './read-projects.ts';

const repos = readCuratedRepos(readProjectFiles());
const previous = JSON.parse(readFileSync(SNAPSHOT_FILE, 'utf8')) as Snapshot;
const result = await refresh({ token: process.env.GITHUB_TOKEN || undefined, repos, previous });

if (result.kind === 'fallback') {
  console.warn(`refresh skipped: ${result.reason}; using committed snapshot`);
} else if (result.kind === 'missing') {
  console.error(
    `repo not found, renamed, or private on GitHub: ${result.repos.join(', ')} — fix or remove the project file (private repos are never listed)`,
  );
  process.exit(1);
} else {
  for (const w of result.warnings) console.warn(`warning: ${w}`);
  writeFileSync(SNAPSHOT_FILE, `${JSON.stringify(result.snapshot, null, 2)}\n`);
  console.log(
    `snapshot updated: ${Object.keys(result.snapshot.repos).length} repos, ${result.snapshot.ideas.length} discussions`,
  );
}
