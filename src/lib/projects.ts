// Merges a curated project entry with its GitHub facts into what pages render.
import { downloadsFromAssets, type Download } from './downloads.ts';
import type { Support } from './project-rules.ts';
import type { RepoFacts } from './types.ts';

export type Status = 'stable' | 'beta' | 'pre-release' | 'archived';
export type Category = 'desktop-app' | 'library' | 'education' | 'tooling';
export type PlatformTag = 'windows' | 'macos' | 'linux' | 'web' | 'python';

export type ProjectEntry = {
  slug: string;
  name: string;
  repo: string;
  tagline: string;
  audience: string;
  support: Support;
  status: Status;
  supportedSince?: Date;
  featured: boolean;
  order: number;
  category: Category;
  platforms: PlatformTag[];
  website?: string;
  docs?: string;
  forkOf?: string;
  ideas: number[];
};

export type PrimaryAction = { kind: 'download' | 'website' | 'repo'; url: string; label: string };

export type ProjectView = ProjectEntry & {
  repoUrl: string;
  stars: number | null;
  license: string | null;
  topics: string[];
  release: { tag: string; publishedAt: string; url: string } | null;
  downloads: Download[];
  primaryAction: PrimaryAction;
  community: { contributing: boolean; codeOfConduct: boolean; securityPolicy: boolean } | null;
};

export function toProjectView(entry: ProjectEntry, facts: RepoFacts | undefined): ProjectView {
  const repoUrl = facts?.url ?? `https://github.com/${entry.repo}`;
  const release = facts?.latestRelease ?? null;
  const downloads = release ? downloadsFromAssets(release.assets) : [];
  const primaryAction: PrimaryAction =
    downloads.length > 0
      ? { kind: 'download', url: downloads[0].url, label: downloads[0].label }
      : entry.website
        ? { kind: 'website', url: entry.website, label: 'Visit website' }
        : { kind: 'repo', url: repoUrl, label: 'View on GitHub' };
  return {
    ...entry,
    status: facts?.archived ? 'archived' : entry.status,
    repoUrl,
    stars: facts ? facts.stars : null,
    license: facts?.license ?? null,
    topics: facts?.topics ?? [],
    release: release ? { tag: release.tag, publishedAt: release.publishedAt, url: release.url } : null,
    downloads,
    primaryAction,
    community: facts
      ? {
          contributing: facts.hasContributing,
          codeOfConduct: facts.hasCodeOfConduct,
          securityPolicy: facts.hasSecurityPolicy,
        }
      : null,
  };
}

export function sortProjects(views: ProjectView[]): ProjectView[] {
  return [...views].sort((a, b) => a.order - b.order || a.name.localeCompare(b.name));
}

export function groupBySupport(views: ProjectView[]): {
  featured: ProjectView[];
  official: ProjectView[];
  incubating: ProjectView[];
  lab: ProjectView[];
} {
  const sorted = sortProjects(views);
  return {
    featured: sorted.filter((v) => v.support === 'official' && v.featured),
    official: sorted.filter((v) => v.support === 'official'),
    incubating: sorted.filter((v) => v.support === 'incubating'),
    lab: sorted.filter((v) => v.support === 'lab'),
  };
}
