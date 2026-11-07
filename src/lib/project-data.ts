// The one src/lib module that touches Astro: loads the projects collection and merges in the
// GitHub snapshot. Not unit-tested; the logic it calls (toProjectView) is.
import { getCollection, type CollectionEntry } from 'astro:content';
import { sortProjects, toProjectView, type ProjectView } from './projects.ts';
import { loadSnapshot } from './snapshot.ts';

export type Project = { view: ProjectView; entry: CollectionEntry<'projects'> };

export async function getProjects(): Promise<Project[]> {
  const entries = await getCollection('projects', ({ data }) => import.meta.env.DEV || !data.draft);
  const { repos } = loadSnapshot();
  const byView = new Map<ProjectView, CollectionEntry<'projects'>>();
  for (const entry of entries) {
    const { icon, screenshots, draft, ...data } = entry.data;
    byView.set(toProjectView({ slug: entry.id, ...data }, repos[data.repo]), entry);
  }
  return sortProjects([...byView.keys()]).map((view) => ({ view, entry: byView.get(view)! }));
}

export async function getProjectViews(): Promise<ProjectView[]> {
  return (await getProjects()).map((p) => p.view);
}
