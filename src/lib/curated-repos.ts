// Reads the `repo:` line, and an optional `repos:` list of other repos the page covers, from each
// project file's frontmatter, without a YAML parser.
const NAME = /^["']?([^"'\s,\]]+)["']?$/;

export function readCuratedRepos(markdownFiles: { name: string; text: string }[]): string[] {
  const repos = new Set<string>();
  for (const { text } of markdownFiles) {
    const fm = /^---\r?\n([\s\S]*?)\r?\n---/.exec(text);
    if (!fm) continue;
    const line = /^repo:\s*["']?([^"'\s]+)["']?\s*$/m.exec(fm[1]);
    if (line) repos.add(line[1]);
    const flow = /^repos:\s*\[([^\]]*)\]\s*$/m.exec(fm[1]);
    const block = /^repos:\s*\r?\n((?:[ \t]+-[^\n]*\r?\n?)+)/m.exec(fm[1]);
    const items = flow ? flow[1].split(',') : block ? block[1].split('\n').map((l) => l.replace(/^\s*-\s*/, '')) : [];
    for (const item of items) {
      const m = NAME.exec(item.trim());
      if (m) repos.add(m[1]);
    }
  }
  return [...repos].sort();
}
