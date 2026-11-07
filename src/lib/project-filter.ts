// The /projects filter rule, shared by the browser script and the tests.
export type Filter = { category: string | null; platform: string | null };

export function matches(item: { category: string; platforms: string[] }, f: Filter): boolean {
  return (!f.category || item.category === f.category) && (!f.platform || item.platforms.includes(f.platform));
}
