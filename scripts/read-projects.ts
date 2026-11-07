// Shared by the CLI scripts: the raw text of every project file.
import { readdirSync, readFileSync } from 'node:fs';

export const PROJECTS_DIR = new URL('../src/content/projects/', import.meta.url);
export const SNAPSHOT_FILE = new URL('../src/data/github-snapshot.json', import.meta.url);

export function readProjectFiles(): { name: string; text: string }[] {
  return readdirSync(PROJECTS_DIR)
    .filter((f) => f.endsWith('.md'))
    .map((name) => ({ name, text: readFileSync(new URL(name, PROJECTS_DIR), 'utf8') }));
}
