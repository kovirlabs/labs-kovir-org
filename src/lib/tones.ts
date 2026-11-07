// Maps support levels, idea statuses and releases to what the markup shows: a TagBrush
// `<mark data-tone>` tone with its label, and a release's tag and dates.
import type { IdeaStatus } from './ideas.ts';
import type { Support } from './project-rules.ts';
import { formatUpdated } from './snapshot.ts';

export type Tone = 'success' | 'info' | 'warning' | 'neutral';
export type Badge = { tone: Tone; label: string };

const SUPPORT: Record<Support, Badge> = {
  official: { tone: 'success', label: 'Officially supported' },
  incubating: { tone: 'info', label: 'Incubating' },
  lab: { tone: 'neutral', label: 'From the lab' },
};

const IDEA: Record<IdeaStatus, Badge> = {
  'under-review': { tone: 'info', label: 'Under review' },
  accepted: { tone: 'success', label: 'Accepted' },
  'in-progress': { tone: 'warning', label: 'In progress' },
  shipped: { tone: 'success', label: 'Shipped' },
  'not-now': { tone: 'neutral', label: 'Not now' },
};

export function supportTone(s: Support): Badge {
  return SUPPORT[s];
}

export function ideaTone(s: IdeaStatus): Badge {
  return IDEA[s];
}

export function releaseLine(
  r: { tag: string; publishedAt: string } | null,
): { tag: string; date: string; iso: string } | null {
  if (!r) return null;
  return { tag: r.tag, date: formatUpdated(r.publishedAt) ?? '', iso: r.publishedAt };
}
