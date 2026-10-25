// Public org repos that have no project file. Not listing a repo is a valid choice; this only informs.
export function uncataloged(publicRepos: string[], curated: string[], ignore: string[]): string[] {
  const skip = new Set([...curated, ...ignore]);
  return publicRepos.filter((r) => !skip.has(r)).sort();
}
