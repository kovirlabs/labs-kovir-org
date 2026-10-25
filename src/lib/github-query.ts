// One GitHub GraphQL request covers every curated repo, the forum's discussions, and the
// org's public repo list. `normalize` turns the response into plain data and sorts errors.
import type { Asset, IdeaFacts, Normalized, RepoFacts } from './types.ts';

export const ORG = 'kovirlabs';
export const FORUM_REPO = 'kovirlabs/community';

const REPO_NAME = /^[\w.-]+\/[\w.-]+$/;

const REPO_FIELDS = `nameWithOwner url description stargazerCount pushedAt isArchived isSecurityPolicyEnabled
    licenseInfo { spdxId }
    repositoryTopics(first: 20) { nodes { topic { name } } }
    contributingGuidelines { url }
    codeOfConduct { url }
    latestRelease { tagName publishedAt url releaseAssets(first: 50) { nodes { name downloadUrl } } }`;

function repoBlock(alias: string, fullName: string, fields: string): string {
  if (!REPO_NAME.test(fullName)) throw new Error(`invalid repo name: ${JSON.stringify(fullName)}`);
  const [owner, name] = fullName.split('/');
  return `  ${alias}: repository(owner: "${owner}", name: "${name}") {\n    ${fields}\n  }`;
}

export function buildQuery(repos: string[]): { query: string; aliases: Record<string, string> } {
  const aliases: Record<string, string> = {};
  const blocks = repos.map((repo, i) => {
    const alias = `r${i}`;
    aliases[alias] = repo;
    return repoBlock(alias, repo, REPO_FIELDS);
  });
  blocks.push(
    repoBlock(
      'forum',
      FORUM_REPO,
      `discussions(first: 100, orderBy: { field: UPDATED_AT, direction: DESC }) {
      nodes { number title url closed createdAt updatedAt upvoteCount
              category { name } labels(first: 10) { nodes { name } } comments { totalCount } }
    }`,
    ),
  );
  blocks.push(
    `  org: organization(login: "${ORG}") {\n    repositories(first: 100, privacy: PUBLIC) { nodes { nameWithOwner isArchived } }\n  }`,
  );
  return { query: `query {\n${blocks.join('\n')}\n}`, aliases };
}

// Loose shapes of the GraphQL response; every field is checked before use.
type Raw = Record<string, any>;

function toRepoFacts(r: Raw): RepoFacts {
  const release = r.latestRelease as Raw | null;
  return {
    fullName: r.nameWithOwner,
    url: r.url,
    description: r.description ?? null,
    stars: r.stargazerCount ?? 0,
    license: r.licenseInfo?.spdxId ?? null,
    topics: (r.repositoryTopics?.nodes ?? []).map((n: Raw) => n.topic.name),
    pushedAt: r.pushedAt,
    archived: Boolean(r.isArchived),
    hasContributing: Boolean(r.contributingGuidelines),
    hasCodeOfConduct: Boolean(r.codeOfConduct),
    hasSecurityPolicy: Boolean(r.isSecurityPolicyEnabled),
    latestRelease: release
      ? {
          tag: release.tagName,
          publishedAt: release.publishedAt,
          url: release.url,
          assets: (release.releaseAssets?.nodes ?? []).map(
            (a: Raw): Asset => ({ name: a.name, url: a.downloadUrl }),
          ),
        }
      : null,
  };
}

function toIdeaFacts(d: Raw): IdeaFacts {
  return {
    number: d.number,
    title: d.title,
    url: d.url,
    category: d.category?.name ?? '',
    labels: (d.labels?.nodes ?? []).map((l: Raw) => l.name),
    upvotes: d.upvoteCount ?? 0,
    comments: d.comments?.totalCount ?? 0,
    createdAt: d.createdAt,
    updatedAt: d.updatedAt,
    closed: Boolean(d.closed),
  };
}

export function normalize(json: unknown, aliases: Record<string, string>): Normalized {
  const body = (json ?? {}) as Raw;
  const data = (body.data ?? {}) as Raw;
  const errors = (Array.isArray(body.errors) ? body.errors : []) as Raw[];
  const errorType = (alias: string): string | undefined =>
    errors.find((e) => Array.isArray(e.path) && e.path[0] === alias)?.type;

  const out: Normalized = { repos: {}, ideas: null, publicRepos: null, missing: [], failed: [] };

  for (const [alias, repo] of Object.entries(aliases)) {
    const r = data[alias];
    if (r) out.repos[repo] = toRepoFacts(r);
    else if (errorType(alias) === 'NOT_FOUND') out.missing.push(repo);
    else out.failed.push(repo);
  }

  const discussions = data.forum?.discussions?.nodes;
  if (Array.isArray(discussions)) out.ideas = discussions.map(toIdeaFacts);

  const orgRepos = data.org?.repositories?.nodes;
  if (Array.isArray(orgRepos)) {
    out.publicRepos = orgRepos.filter((r: Raw) => !r.isArchived).map((r: Raw) => r.nameWithOwner);
  }
  return out;
}
