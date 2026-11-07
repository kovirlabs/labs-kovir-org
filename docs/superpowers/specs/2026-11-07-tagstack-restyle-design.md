# labs.kovir.org restyle on the Tag family — Design

Date: 2026-11-07 · Status: approved in conversation, spec for owner review · Owner: Evan Gress

Rebuild the look and behavior of labs.kovir.org on the Kovir Labs Tag family
(<https://github.com/kovirlabs/tagstack>): **TagBrush.css** for styling, **TagAction** for
behavior, and **TagCheck** for checking. Keep Kovir's colors, fonts, and overall look.

---

## 1. Understanding

**From the owner**
- Keep the same colors and visuals.
- Use the Tag family and semantic HTML as much as is reasonable, while still giving a pleasant
  experience.
- A small custom CSS file and a small custom JavaScript file are allowed for anything the family
  does not cover.
- **Goal: showcase the Tag family.** The Labs site doubles as a live example. It should be as
  close to classless as possible, TagCheck-clean, and keep its custom CSS visibly small.
- **TagCheck gates CI and deploys.**
- **Approach: semantic rewrite.** Rewrite components as semantic HTML. Do not keep the old
  classes under a TagBrush base layer, and do not rebuild from TagKit templates.

**Constraints (from `CLAUDE.md` and `netlify.toml`)**
- The CSP is `default-src 'self'; style-src 'self'; script-src 'self'; …`. There are no
  third-party requests, no inline `style=`, and no executable inline `<script>`. Both libraries
  are installed from npm and served from the site, never from jsDelivr.
- Fonts stay self-hosted through `@fontsource`.
- `src/lib/` stays pure TypeScript with unit tests.

**Success looks like**
- Every page looks recognizably like today's site, in light and dark mode, at desktop and phone
  widths.
- `tagcheck dist --strict --browser` reports 0 errors and 0 warnings, and CI enforces it.
- The only CSS outside TagBrush is `src/styles/kovir.css`, about 40 lines of brand rules plus the
  theme variables. The only page JavaScript outside TagAction is `src/scripts/site.ts`.
- Every page still works with JavaScript off.

---

## 2. Libraries, theme, and the CSP

**Install and load**
- Add the dependencies `tagbrush@^1` and `tagaction@^0`.
- `src/layouts/Base.astro` imports `tagbrush/min`, then `../styles/kovir.css`. Astro emits both
  as files under `/_astro/`.
- TagAction loads from a bundled module: `<script>import 'tagaction';</script>` in `Base.astro`.
- Delete `src/styles/global.css` and every `<style>` block in `src/components/` and
  `src/pages/`.

**`src/styles/kovir.css`** has two parts, and each rule carries a comment saying why it exists.

1. **Theme variables** on `:root`, using TagBrush's documented hooks, with `light-dark()` so the
   site keeps following the reader's color scheme:

   | Variable | Light | Dark |
   |---|---|---|
   | `--color-primary` | `#3a787a` (teal) | `#3a787a` |
   | `--color-background` | `#f1eee9` (eggshell) | `#232626` |
   | `--color-surface` | `#ffffff` | `#2d3131` |
   | `--color-border` | `#d6cfc3` | `#3e4444` |
   | `--color-text` | `#323232` | `#f1eee9` |
   | `--color-text-muted` | `#5c5852` | `#bdb7ad` |
   | `--color-highlight` | `#8d440f` (rust) | `#dfad05` (gold) |

   - `--font-family-heading: 'Manrope', system-ui, sans-serif`
   - `--font-family-base: 'Inter', system-ui, sans-serif`
   - `--font-family-mono: 'JetBrains Mono', ui-monospace, monospace`
   - `--border-radius: 10px`
   - `--hero-background`: a tint toward teal-dark `#2a5657`

2. **Brand touches** TagBrush cannot express. These use **no invented classes**, only ids,
   structure, and documented attributes:
   - Logo size in the top bar.
   - Project icons (56px, or 44px in "From the lab") and the monogram tile.
   - The teal band (`#how-it-works`, `#kovir-band`), with the lighter muted and gold values that
     keep 4.5:1 contrast on it.
   - The whole project card clickable through its title link (`::after` overlay) with a visible
     focus ring.
   - Support badge colors: Official uses Kovir teal with a gold border, and Incubating uses an
     outlined highlight. This is done here because the CSP forbids the documented inline `--tone`
     override.

**`src/scripts/site.ts`** holds only what TagAction does not do:
- The /projects **category and platform filter**. It reveals the hidden `<search>`, hides
  non-matching cards and empty groups, and updates the "n of m projects" count. It reuses
  `src/lib/project-filter.ts`. TagAction's type-to-filter can't replace this because it matches
  text, not structured fields.
- The **/contact prefill** from `?type=&project=`, reusing `src/lib/contact-prefill.ts`.
- `src/scripts/project-filter.ts` and `src/scripts/contact-form.ts` merge into this file and are
  deleted.

**TagAction takes over:**
- `aria-current` in the nav (the hand-written `current()` logic in `Header.astro` goes)
- inline form validation messages
- `aria-busy` on the submit button and the unsaved-changes warning
- sortable tables
- type-to-filter search on the repository table
- relative and local `<time>`
- copy buttons on `<pre>`
- the image viewer
- `#` links on headings that have an `id`

**CSP risk.** TagAction injects its small styles through `document.adoptedStyleSheets`, with a
`<style>`-element fallback. The fallback would be blocked by `style-src 'self'`. Step one of the
implementation proves TagAction loads under the real CSP headers with no violations in Chromium,
Firefox, and WebKit. If any engine blocks it, the site ships those rules in `kovir.css`, and the
CSP is not loosened.

---

## 3. Page and component mapping

Styling comes from elements. The only classes allowed are TagBrush's documented ones (`button`,
`secondary`, `outline`, `container`, `grid`, `card`, `striped`, `visually-hidden`).

### Layout (`Base.astro`, `Header.astro`, `Footer.astro`)
- **Top bar:** `<header><nav>` containing a home link around the logo `<picture>` (alt "Kovir
  Labs"), then `<ul>` with Projects, Ideas, and About, and `<a class="button" href="/contact">`.
- **Hero slot:** `Base` gets an optional named slot `hero`, rendered inside `<header>` after the
  `<nav>`. TagBrush draws the hero only for an `<hgroup>` in the page header.
- **Footer:** `<footer>` contains:
  - an about `<p>`
  - `<nav aria-label="Kovir Labs">` with `<h2>` and `<ul>`: Projects, Ideas, About, Contact,
    Privacy
  - `<nav aria-label="Community">` with `<h2>` and `<ul>`: GitHub, Community forum,
    info@kovir.org
  - `<p>© {year} Kovir LLC · <a href="https://www.kovir.org">kovir.org</a></p>`
  - `<p>Project data updated <time datetime>…</time></p>`
- The skip link stays, as `<a class="visually-hidden">`, made visible on focus by one rule in
  `kovir.css`.

### Home (`pages/index.astro`)
- **Hero:** `<hgroup>` with an eyebrow `<p>`, the `<h1>` (its second line in `<em>`, colored by one
  `kovir.css` rule as today's accent), and the lede `<p>`. Then `<div role="group">` with "Browse projects"
  (`button`) and "Suggest an idea" (`button outline`).
- **"Officially supported"** and **"From the lab":** each is a `<section>` with `<h2>`, an
  optional `<p>`, and one `<article>` per project. TagBrush's article grid replaces
  `.grid`/`.card`.
- **"How ideas become software"** (`#how-it-works`, teal band): `<section>` with `<h2>` and three
  `<article>`s, each starting with `<hgroup><p>1</p><h3>Suggest</h3></hgroup>`.
- **"Part of Kovir LLC"** (`#kovir-band`, rendered by `KovirBand.astro`): `<section><header><h2>…</h2><a class="button outline"
  …>Visit kovir.org</a></header><p>…</p></section>`.

### Project card (`ProjectCard.astro`, absorbing `SupportBadge`, `ReleaseBadge`, `PlatformList`)
```
<article data-category data-platforms>
  <header>
    <img (icon) alt="">  or  <span aria-hidden="true">N</span> (monogram)
    <hgroup><h3><a href="/projects/slug">Name</a></h3><p>Tagline</p></hgroup>
  </header>
  <p><mark data-tone="success|info|neutral">Officially supported|Incubating|From the lab</mark></p>
  <p>For: audience</p>                        (full cards only)
  <footer>
    <data value="tag">v1.2.0</data> · <time datetime>…</time>   (or "No release yet")
    · platforms as text
  </footer>
</article>
```
`data-category` and `data-platforms` are plain attributes that `site.ts` reads. They are not
`data-tag…` attributes, so TagCheck has no reason to flag them. The implementation confirms this.

### /projects (`pages/projects/index.astro`)
- `<header><h1>Projects</h1></header>`, then the lede.
- **Filters:** `<search hidden>` with labelled category and platform `<select>`s and an
  `<output>` for the count. `site.ts` reveals it.
- One `<section>` per support group, each with `<h2>`, a `<p>`, and the card `<article>`s.
- **All repositories** (`<section id="all-repositories">`):
  - `<header><h2>All repositories</h2></header>` and the explanatory `<p>`
  - `<search><input type="search" aria-label="Filter repositories" aria-controls="repo-table"></search>`
  - `<table id="repo-table">` with columns Repository (link), Description, Language, Updated
    (`<time datetime>`), and Status (`<mark data-tone="success"><a href="/projects/slug">Project
    page</a></mark>` or `<mark data-tone="neutral">Not reviewed</mark>`)
  - TagAction sorts it and filters it as you type. `RepoList.astro` renders it, and
    `src/lib/all-repos.ts` is unchanged.

### Project detail (`pages/projects/[slug].astro`, `DownloadButtons.astro`)
- `<main>` with one `<article>`, so it gets reading width.
- Header: `<hgroup>` (name and tagline), the support `<mark>`, and a release line with
  `<time data-tag-time="relative">`.
- Downloads: `<div role="group">` of `<a class="button">` links (the first is primary, the rest
  `secondary`).
- Screenshots: `<figure><a href="full.png"><img …></a><figcaption>…</figcaption></figure>`, which
  opens TagAction's viewer.
- Community health: a plain `<ul>` of links (Contributing guide, Code of conduct, Security
  policy), as today.
- "Request a feature" and "Report a problem": `<div role="group">` of `button outline` links.

### Ideas (`pages/ideas.astro`, `IdeaList.astro`)
- `<table>` with Idea (link), Upvotes (`<data value>`), Comments (`<data value>`), and Status
  (`<mark data-tone>` from the `status:` label: under-review → `info`, accepted → `success`,
  in-progress → `warning`, shipped → `success`, not-now → `neutral`).
- The empty state is a plain `<p>`.
- "Suggest an idea" buttons in a `<div role="group">`.

### Contact (`pages/contact.astro`, `contact/thanks.astro`)
- `<main><article><form>`, which gives TagBrush's narrow centered form column.
- Labels with `for`, help text in `<small>`, and the required fields marked with the browser's
  own attributes so TagAction shows the messages.
- These stay unchanged: Netlify Forms attributes (`data-netlify`, `netlify-honeypot`, the
  hidden `form-name`), the `action="/contact/thanks/"` redirect, and `data-slugs` for prefill.

### About, Privacy, 404, Thanks
- Plain `<article>` prose. A `.lede` becomes an `<hgroup>` subtitle.
- The "Part of Kovir LLC" band on About reuses the home markup.

---

## 4. TagCheck, testing, and rollout

**TagCheck**
- Add the dev dependencies `@kovirlabs/tagcheck` and `playwright` (for `--browser`), and the script
  `"tagcheck": "tagcheck dist --strict --browser"`.
- `--strict` fails on warnings, so invented classes, `<style>` blocks, and skipped headings all
  block. `--browser` adds WCAG AA contrast in light and dark mode, and phone-width overflow.
- Early verification: confirm browser mode loads the self-hosted `/_astro/` assets when given a
  folder. If it doesn't, the script serves `dist` with `astro preview` and checks that origin.
  If browser mode measures unstyled pages because of a load failure, `not-loaded` fails it under
  `--strict`, so a silent pass is impossible.
- **CI:** in `.github/workflows/deploy.yml`, both `fallback-build` (PR checks) and `deploy` run
  `npx playwright install --with-deps chromium` and then `npm run tagcheck` after
  `npm run build`. Any finding fails the job and blocks the deploy.

**Testing**
- The `src/lib` unit tests stay green. `project-filter.ts`, `contact-prefill.ts`, and
  `all-repos.ts` keep their tests.
- The CSP proof page described in §2 runs before any page is rewritten. It is not committed.
- After each commit group, run:
  - `npm test`
  - `npm run check`
  - `npm run build`
  - `npm run tagcheck`
  - a browser check at 1280px and 375px, in light and dark mode, covering:
    - hero
    - cards and the whole-card click
    - teal band contrast
    - table sort and filter
    - project filter
    - contact validation and busy state
    - image viewer
    - JavaScript off (every page readable and the form submittable)

**Rollout**
- **Branch:** `restyle-tagstack`, from `main` (which already includes PR #2).
- **Commits, in order:**
  1. libraries, `kovir.css` theme, and the CSP proof
  2. layout, header, and footer
  3. home
  4. projects, project detail, and all repositories
  5. ideas and contact
  6. about, privacy, 404, and thanks, with `global.css` deleted
  7. TagCheck in CI
- **One PR**, with before and after screenshots of home, /projects, a project page, and contact,
  in both color schemes.

**Out of scope:** new pages or features, copy changes beyond what the new markup needs, TagKit
templates or its include build, and changes to the GitHub data pipeline.
