// /contact: prefill the form from ?type=&project= links (e.g. "Request a feature" on a project
// page). Without JavaScript the form still works; it just starts blank. After a successful
// submission Netlify redirects to /contact/thanks/.
import { prefill } from '../lib/contact-prefill.ts';

const form = document.querySelector<HTMLFormElement>('#contact-form');
if (form) {
  const { type, project } = prefill(location.search, (form.dataset.slugs ?? '').split(' ').filter(Boolean));
  if (type) (form.elements.namedItem('type') as HTMLSelectElement).value = type;
  if (project) (form.elements.namedItem('project') as HTMLSelectElement).value = project;
}
