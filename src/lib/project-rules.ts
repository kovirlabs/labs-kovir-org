// Cross-field rules for project frontmatter, enforced by the content schema.
export type Support = 'official' | 'incubating' | 'lab';

export function projectRuleErrors(d: { support: Support; featured: boolean; supportedSince?: Date }): string[] {
  const errors: string[] = [];
  if (d.featured && d.support !== 'official') errors.push('featured requires support: official');
  if (d.support === 'official' && !d.supportedSince) errors.push('support: official requires supportedSince');
  return errors;
}
