// Human-readable labels for frontmatter values.
import type { Category, PlatformTag, Status } from './projects.ts';

export const PLATFORM_LABEL: Record<PlatformTag, string> = {
  windows: 'Windows',
  macos: 'macOS',
  linux: 'Linux',
  web: 'Web',
  python: 'Python',
};

export const CATEGORY_LABEL: Record<Category, string> = {
  'desktop-app': 'Desktop app',
  library: 'Library',
  education: 'Education',
  tooling: 'Tooling',
};

export const STATUS_LABEL: Record<Status, string> = {
  stable: 'Stable',
  beta: 'Beta',
  'pre-release': 'Pre-release',
  archived: 'Archived',
};
