// Rows for the "All repositories" list: every public org repo except infrastructure, newest
// push first. Curated repos link to their project page; the rest are marked as not reviewed.
import { formatUpdated } from './snapshot.ts';
import type { PublicRepo } from './types.ts';

export type RepoRow = {
  name: string;
  url: string;
  description: string | null;
  language: string | null;
  /** Display date, e.g. "1 Nov 2026". */
  updated: string;
  updatedIso: string;
  fork: boolean;
  /** Link to the curated project page, or null when Kovir has not reviewed the repo. */
  projectHref: string | null;
};

/** `curated` maps a repo's full name to its project slug. */
export function toRepoRows(publicRepos: PublicRepo[], curated: Record<string, string>, ignore: string[]): RepoRow[] {
  const skip = new Set(ignore);
  return publicRepos
    .filter((r) => !skip.has(r.fullName))
    .sort((a, b) => b.pushedAt.localeCompare(a.pushedAt))
    .map((r) => {
      const slug = curated[r.fullName];
      return {
        name: r.fullName.split('/')[1],
        url: r.url,
        description: r.description?.trim() || null,
        language: r.language,
        updated: formatUpdated(r.pushedAt) ?? '',
        updatedIso: r.pushedAt,
        fork: r.fork,
        projectHref: slug ? `/projects/${slug}` : null,
      };
    });
}
