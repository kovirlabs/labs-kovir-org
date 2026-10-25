// Progressive enhancement for /projects: reveal the filter form and hide non-matching cards.
// Without JavaScript the form stays hidden and every project is listed.
import { matches } from '../lib/project-filter.ts';

const form = document.querySelector<HTMLFormElement>('#project-filter');
if (form) {
  const cards = [...document.querySelectorAll<HTMLElement>('[data-category]')];
  const groups = [...document.querySelectorAll<HTMLElement>('[data-group]')];
  const empty = document.querySelector<HTMLElement>('#no-match');
  const count = form.querySelector<HTMLElement>('.count');

  const apply = () => {
    const data = new FormData(form);
    const filter = {
      category: (data.get('category') as string) || null,
      platform: (data.get('platform') as string) || null,
    };
    let shown = 0;
    for (const card of cards) {
      const ok = matches(
        { category: card.dataset.category ?? '', platforms: (card.dataset.platforms ?? '').split(' ') },
        filter,
      );
      card.hidden = !ok;
      if (ok) shown++;
    }
    for (const g of groups) g.hidden = !g.querySelector('[data-category]:not([hidden])');
    if (empty) empty.hidden = shown > 0;
    if (count) count.textContent = `${shown} of ${cards.length} projects`;
  };

  form.hidden = false;
  form.addEventListener('change', apply);
  form.addEventListener('submit', (e) => e.preventDefault());
  apply();
}
