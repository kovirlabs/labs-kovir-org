// Turns release asset names into download buttons. Anything not listed in RULES
// (signatures, updater bundles, latest.json, license HTML) is ignored.
import type { Asset } from './types.ts';

export type Platform = 'windows' | 'macos' | 'linux';
export type Download = { platform: Platform; label: string; url: string; primary: boolean };

type Kind = 'setup' | 'msi' | 'dmg-arm' | 'dmg-intel' | 'appimage' | 'deb' | 'rpm';

const RULES: { kind: Kind; platform: Platform; label: string; match: (n: string) => boolean }[] = [
  { kind: 'setup', platform: 'windows', label: 'Windows installer', match: (n) => n.endsWith('-setup.exe') },
  { kind: 'msi', platform: 'windows', label: 'Windows (MSI)', match: (n) => n.endsWith('.msi') },
  { kind: 'dmg-arm', platform: 'macos', label: 'macOS (Apple Silicon)', match: (n) => n.endsWith('.dmg') && /aarch64|arm64/.test(n) },
  { kind: 'dmg-intel', platform: 'macos', label: 'macOS (Intel)', match: (n) => n.endsWith('.dmg') && /x64|x86_64/.test(n) },
  { kind: 'appimage', platform: 'linux', label: 'Linux (AppImage)', match: (n) => n.endsWith('.appimage') },
  { kind: 'deb', platform: 'linux', label: 'Linux (.deb)', match: (n) => n.endsWith('.deb') },
  { kind: 'rpm', platform: 'linux', label: 'Linux (.rpm)', match: (n) => n.endsWith('.rpm') },
];

export function downloadsFromAssets(assets: Asset[]): Download[] {
  const found = new Map<Kind, { rule: (typeof RULES)[number]; url: string }>();
  for (const asset of assets) {
    const name = asset.name.toLowerCase();
    const rule = RULES.find((r) => r.match(name));
    if (rule && !found.has(rule.kind)) found.set(rule.kind, { rule, url: asset.url });
  }
  const primary = (kind: Kind): boolean => {
    if (kind === 'msi') return !found.has('setup');
    if (kind === 'deb') return !found.has('appimage');
    return kind !== 'rpm';
  };
  // RULES is already in platform order; within a platform, primaries come first.
  const all = RULES.filter((r) => found.has(r.kind)).map((r) => ({
    platform: r.platform,
    label: r.label,
    url: found.get(r.kind)!.url,
    primary: primary(r.kind),
  }));
  const platforms: Platform[] = ['windows', 'macos', 'linux'];
  return platforms.flatMap((p) => {
    const mine = all.filter((d) => d.platform === p);
    return [...mine.filter((d) => d.primary), ...mine.filter((d) => !d.primary)];
  });
}
