// The committed GitHub snapshot that every page renders from.
import data from '../data/github-snapshot.json' with { type: 'json' };
import type { Snapshot } from './types.ts';

export function loadSnapshot(): Snapshot {
  return data as Snapshot;
}

export function formatUpdated(fetchedAt: string | null): string | null {
  if (!fetchedAt) return null;
  return new Date(fetchedAt).toLocaleDateString('en-GB', {
    day: 'numeric',
    month: 'short',
    year: 'numeric',
    timeZone: 'UTC',
  });
}
