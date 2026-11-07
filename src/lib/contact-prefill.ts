// Reads ?type= and ?project= from a contact link. Unknown values are ignored, so a stale or
// edited link still opens a working form.
export const CONTACT_TYPES = ['idea', 'question', 'problem', 'other'] as const;
export type ContactType = (typeof CONTACT_TYPES)[number];

export function prefill(search: string, slugs: string[]): { type?: ContactType; project?: string } {
  const params = new URLSearchParams(search);
  const out: { type?: ContactType; project?: string } = {};
  const type = params.get('type');
  if (type && (CONTACT_TYPES as readonly string[]).includes(type)) out.type = type as ContactType;
  const project = params.get('project');
  if (project && slugs.includes(project)) out.project = project;
  return out;
}
