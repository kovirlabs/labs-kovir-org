// Fetches fresh GitHub data and decides what the snapshot becomes. GitHub being unreachable is
// never fatal (the committed snapshot stays); a curated repo that no longer exists is.
import { buildQuery, normalize } from './github-query.ts';
import type { Snapshot } from './types.ts';

export const GRAPHQL_URL = 'https://api.github.com/graphql';

export type RefreshResult =
  | { kind: 'ok'; snapshot: Snapshot; warnings: string[] }
  | { kind: 'fallback'; reason: string }
  | { kind: 'missing'; repos: string[] };

export async function refresh(opts: {
  token: string | undefined;
  repos: string[];
  previous: Snapshot;
  fetchImpl?: typeof fetch;
  now?: () => Date;
}): Promise<RefreshResult> {
  const { token, repos, previous, fetchImpl = fetch, now = () => new Date() } = opts;
  if (!token) return { kind: 'fallback', reason: 'no GITHUB_TOKEN' };

  const { query, aliases } = buildQuery(repos);
  let body: unknown;
  try {
    const res = await fetchImpl(GRAPHQL_URL, {
      method: 'POST',
      headers: {
        Authorization: `bearer ${token}`,
        'Content-Type': 'application/json',
        'User-Agent': 'labs-kovir-org',
      },
      body: JSON.stringify({ query }),
    });
    if (!res.ok) return { kind: 'fallback', reason: `GitHub responded ${res.status}` };
    body = await res.json();
  } catch (err) {
    return { kind: 'fallback', reason: `request failed: ${(err as Error).message}` };
  }
  if (!body || typeof body !== 'object' || !('data' in body) || !body.data) {
    const message = (body as { message?: string } | null)?.message;
    return { kind: 'fallback', reason: `no data in response${message ? `: ${message}` : ''}` };
  }

  const n = normalize(body, aliases);
  if (n.missing.length > 0) return { kind: 'missing', repos: n.missing };

  const warnings: string[] = [];
  const reposOut = { ...n.repos };
  for (const repo of n.failed) {
    const kept = previous.repos[repo];
    if (kept) reposOut[repo] = kept;
    warnings.push(`${repo}: GitHub returned an error; ${kept ? 'kept previous data' : 'no previous data'}`);
  }
  if (n.ideas === null) warnings.push('forum discussions unavailable; kept previous ideas');
  if (n.publicRepos === null) warnings.push('org repo list unavailable; kept previous list');

  return {
    kind: 'ok',
    warnings,
    snapshot: {
      fetchedAt: now().toISOString(),
      repos: reposOut,
      ideas: n.ideas ?? previous.ideas,
      publicRepos: n.publicRepos ?? previous.publicRepos,
    },
  };
}
