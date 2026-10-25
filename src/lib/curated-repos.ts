// Reads the `repo:` line from each project file's frontmatter, without a YAML parser.
export function readCuratedRepos(markdownFiles: { name: string; text: string }[]): string[] {
  const repos = new Set<string>();
  for (const { text } of markdownFiles) {
    const fm = /^---\r?\n([\s\S]*?)\r?\n---/.exec(text);
    if (!fm) continue;
    const line = /^repo:\s*["']?([^"'\s]+)["']?\s*$/m.exec(fm[1]);
    if (line) repos.add(line[1]);
  }
  return [...repos].sort();
}
