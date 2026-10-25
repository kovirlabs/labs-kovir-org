// /contact: prefill from ?type=&project= links, and show the thank-you state after Netlify
// redirects back with ?success=true. Without JavaScript the form still works; it just starts blank.
import { prefill } from '../lib/contact-prefill.ts';

const form = document.querySelector<HTMLFormElement>('#contact-form');
const thanks = document.querySelector<HTMLElement>('#thanks');
if (form) {
  const params = new URLSearchParams(location.search);
  if (params.get('success') === 'true' && thanks) {
    thanks.hidden = false;
    form.hidden = true;
  } else {
    const { type, project } = prefill(location.search, (form.dataset.slugs ?? '').split(' ').filter(Boolean));
    if (type) (form.elements.namedItem('type') as HTMLSelectElement).value = type;
    if (project) (form.elements.namedItem('project') as HTMLSelectElement).value = project;
  }
}
