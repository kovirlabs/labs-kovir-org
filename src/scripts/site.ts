// The only page script beyond TagAction: what TagAction doesn't do. Each part looks for its
// element and does nothing on pages without it. Without JavaScript every project is listed and
// the contact form simply starts blank.
import { matches } from '../lib/project-filter.ts';
import { prefill } from '../lib/contact-prefill.ts';

// /projects: filter the cards by category and platform. TagAction's type-to-filter matches
// text, so structured fields need this. The <search> is hidden until this runs.
const filter = document.querySelector<HTMLElement>('search#project-filter');
if (filter) {
  const cards = [...document.querySelectorAll<HTMLElement>('main article[data-category]')];
  const groups = [...document.querySelectorAll<HTMLElement>('main section:has(> article[data-category])')];
  const empty = document.querySelector<HTMLElement>('#no-match');
  const count = filter.querySelector('output');
  const category = filter.querySelector<HTMLSelectElement>('select[name="category"]');
  const platform = filter.querySelector<HTMLSelectElement>('select[name="platform"]');

  const apply = () => {
    const f = { category: category?.value || null, platform: platform?.value || null };
    let shown = 0;
    for (const card of cards) {
      const ok = matches(
        { category: card.dataset.category ?? '', platforms: (card.dataset.platforms ?? '').split(' ') },
        f,
      );
      card.hidden = !ok;
      if (ok) shown++;
    }
    for (const g of groups) g.hidden = !g.querySelector('article[data-category]:not([hidden])');
    if (empty) empty.hidden = shown > 0;
    if (count) count.textContent = `${shown} of ${cards.length} projects`;
  };

  filter.hidden = false;
  filter.addEventListener('change', apply);
  apply();
}

// /contact: prefill the form from ?type=&project= links, e.g. "Request a feature" on a project.
const form = document.querySelector<HTMLFormElement>('form#contact-form');
if (form) {
  const { type, project } = prefill(location.search, (form.dataset.slugs ?? '').split(' ').filter(Boolean));
  if (type) (form.elements.namedItem('type') as HTMLSelectElement).value = type;
  if (project) (form.elements.namedItem('project') as HTMLSelectElement).value = project;
}
