// Turns forum discussions into the idea board. Status comes from `status: …` labels, which the
// kovir.org team applies when it reviews ideas.
import type { IdeaFacts } from './types.ts';

export type IdeaStatus = 'under-review' | 'accepted' | 'in-progress' | 'shipped' | 'not-now';

export type IdeaView = {
  number: number;
  title: string;
  url: string;
  upvotes: number;
  comments: number;
  updatedAt: string;
  status: IdeaStatus;
  fromForm: boolean;
};

// Most advanced first: when an idea carries several status labels, the first match wins.
const PRECEDENCE: IdeaStatus[] = ['shipped', 'in-progress', 'accepted', 'not-now', 'under-review'];
const OPEN: IdeaStatus[] = ['under-review', 'accepted', 'in-progress'];

export function ideaStatus(labels: string[]): IdeaStatus | null {
  return PRECEDENCE.find((s) => labels.includes(`status: ${s}`)) ?? null;
}

const byDemand = (a: IdeaView, b: IdeaView): number =>
  b.upvotes - a.upvotes || b.updatedAt.localeCompare(a.updatedAt);

export function toIdeaViews(ideas: IdeaFacts[]): IdeaView[] {
  const views: IdeaView[] = [];
  for (const idea of ideas) {
    if (idea.category !== 'Ideas') continue;
    const labeled = ideaStatus(idea.labels);
    // A closed idea nobody labeled is spam or a duplicate: keep it off the board.
    if (idea.closed && !labeled) continue;
    views.push({
      number: idea.number,
      title: idea.title,
      url: idea.url,
      upvotes: idea.upvotes,
      comments: idea.comments,
      updatedAt: idea.updatedAt,
      status: labeled ?? 'under-review',
      fromForm: idea.labels.includes('source: form'),
    });
  }
  return views.sort(byDemand);
}

export function groupIdeas(views: IdeaView[]): {
  active: IdeaView[];
  underReview: IdeaView[];
  shipped: IdeaView[];
  notNow: IdeaView[];
} {
  const sorted = [...views].sort(byDemand);
  return {
    active: sorted.filter((v) => v.status === 'accepted' || v.status === 'in-progress'),
    underReview: sorted.filter((v) => v.status === 'under-review'),
    shipped: sorted.filter((v) => v.status === 'shipped'),
    notNow: sorted.filter((v) => v.status === 'not-now'),
  };
}

export function topIdeas(views: IdeaView[], n: number): IdeaView[] {
  return views.filter((v) => OPEN.includes(v.status)).sort(byDemand).slice(0, n);
}
