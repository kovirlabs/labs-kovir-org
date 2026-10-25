// Shared data types for GitHub facts and the committed snapshot. No logic here.

export type Asset = { name: string; url: string };

export type ReleaseFacts = { tag: string; publishedAt: string; url: string; assets: Asset[] };

export type RepoFacts = {
  fullName: string;
  url: string;
  description: string | null;
  stars: number;
  license: string | null;
  topics: string[];
  pushedAt: string;
  archived: boolean;
  hasContributing: boolean;
  hasCodeOfConduct: boolean;
  hasSecurityPolicy: boolean;
  latestRelease: ReleaseFacts | null;
};

export type IdeaFacts = {
  number: number;
  title: string;
  url: string;
  category: string;
  labels: string[];
  upvotes: number;
  comments: number;
  createdAt: string;
  updatedAt: string;
  closed: boolean;
};

export type Snapshot = {
  fetchedAt: string | null;
  repos: Record<string, RepoFacts>;
  ideas: IdeaFacts[];
  publicRepos: string[];
};

export type Normalized = {
  repos: Record<string, RepoFacts>;
  /** null when the forum block could not be read. */
  ideas: IdeaFacts[] | null;
  /** null when the org block could not be read. Archived repos are excluded. */
  publicRepos: string[] | null;
  /** Curated repos GitHub reported as NOT_FOUND. */
  missing: string[];
  /** Curated repos that errored for any other reason. */
  failed: string[];
};
