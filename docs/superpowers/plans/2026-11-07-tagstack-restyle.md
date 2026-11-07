# Tag Family Restyle Implementation Plan

> **For agentic workers:** REQUIRED SUB-SKILL: Use superpowers:subagent-driven-development (recommended) or superpowers:executing-plans to implement this plan task-by-task. Steps use checkbox (`- [ ]`) syntax for tracking.

**Goal:** Rebuild labs.kovir.org's look and behavior on TagBrush.css and TagAction, keeping Kovir's colors and fonts, with TagCheck `--strict --browser` gating CI.

**Architecture:** Astro pages are rewritten as classless semantic HTML. TagBrush is themed by CSS variables in one small `src/styles/kovir.css`. TagAction provides behavior from a bundled module. The only page script beyond that is `src/scripts/site.ts`. Pure mapping logic (badge tones) lives in `src/lib/` with unit tests, and a repo-wide style guard test keeps invented classes and `<style>` blocks out.

**Tech Stack:** Astro 7 (static), TypeScript erasable-only on Node's test runner, `tagbrush@^1`, `tagaction@^0`, `@kovirlabs/tagcheck`, `playwright` (dev, for `--browser` and the CSP proof).

**Spec:** `docs/superpowers/specs/2026-11-07-tagstack-restyle-design.md`

## Global Constraints

- The CSP in `netlify.toml` stays exactly `default-src 'self'; img-src 'self' data:; style-src 'self'; script-src 'self'; form-action 'self'; frame-ancestors 'none'; base-uri 'self'; object-src 'none'`. No CDN URLs, no inline `style=`, no executable inline `<script>`.
- The only classes in markup are TagBrush's documented ones: `button`, `secondary`, `outline`, `container`, `grid`, `card`, `striped`, `visually-hidden`.
- `kovir.css` uses no class selectors. It targets ids, element structure, and documented attributes only. Every rule carries a comment saying why it exists.
- No `<style>` blocks in any `.astro` file once Task 6 lands.
- Theme values, verbatim from spec §2 (light / dark):
  - `--color-primary` `#3a787a` / `#3a787a`
  - `--color-background` `#f1eee9` / `#232626`
  - `--color-surface` `#ffffff` / `#2d3131`
  - `--color-border` `#d6cfc3` / `#3e4444`
  - `--color-text` `#323232` / `#f1eee9`
  - `--color-text-muted` `#5c5852` / `#bdb7ad`
  - `--color-highlight` `#8d440f` / `#dfad05`
  - `--border-radius: 10px`
  - fonts: Manrope (headings), Inter (body), JetBrains Mono (mono)
- These stay unchanged: `src/lib/` behavior and tests, Netlify Forms attributes, the honeypot, `action="/contact/thanks/"`, the footer `© <year> Kovir LLC` with a link to www.kovir.org, and `@fontsource` self-hosting.
- `src/lib/` must not import Astro. Relative imports use `.ts`. No `enum`, `namespace`, or parameter properties.

## Review Focus

1. **JavaScript off.** Every card is listed, the hidden `<search>` stays hidden, tables read in source order, and the contact form submits. (Task 4 and Task 5 verification steps.)
2. **Teal band in light mode.** Muted text and links on `#how-it-works` and `#kovir-band` must keep 4.5:1. (Task 3, enforced by TagCheck `contrast` in Task 7.)
3. **Long descriptions at 375px.** The repo table and long project names must not cause sideways page scroll. (Task 4, enforced by TagCheck `overflow` in Task 7.)
4. **Project with no icon and no release.** The monogram renders and "No release yet" shows. (Task 3 test via `releaseLine`.)
5. **Idea with no status label.** It defaults to `under-review` and maps to `info`. (Task 5 `ideaTone` test.)

---

## File Structure

| File | Responsibility |
|---|---|
| `src/styles/kovir.css` (new) | Theme variables and the few brand rules |
| `src/lib/tones.ts` (new) | `supportTone`, `ideaTone`, `releaseLine`: pure mappings used by markup |
| `src/lib/tones.test.ts` (new) | Tests for the above |
| `scripts/style-rules.test.ts` (new) | Guard: no undocumented classes in `.astro`, no `<style>` blocks, no class selectors in `kovir.css` |
| `src/scripts/site.ts` (new) | Project filter and contact prefill; replaces `project-filter.ts` and `contact-form.ts` |
| `src/layouts/Base.astro` | Imports TagBrush, `kovir.css`, and TagAction; adds the `hero` slot |
| `src/components/{Header,Footer,ProjectCard,KovirBand,RepoList,IdeaList,DownloadButtons}.astro` | Rewritten semantic markup |
| `src/components/{SupportBadge,ReleaseBadge,PlatformList}.astro` | Deleted (absorbed by ProjectCard and `tones.ts`) |
| `src/styles/global.css`, `src/scripts/project-filter.ts`, `src/scripts/contact-form.ts` | Deleted |
| `.github/workflows/deploy.yml`, `package.json` | TagCheck script and CI steps |

---

### Task 1: Libraries, theme, guard test, and CSP proof

**Files:**
- Modify: `package.json` (deps `tagbrush@^1`, `tagaction@^0`; devDeps `playwright`), `src/layouts/Base.astro`
- Create: `src/styles/kovir.css`, `scripts/style-rules.test.ts`

**Interfaces:**
- Produces: `kovir.css` theme variables; `Base.astro` loads `tagbrush/min` → `global.css` (temporary, still last so the old look holds until Task 6) → `kovir.css`, plus `<script>import 'tagaction';</script>`.
- Produces: `scripts/style-rules.test.ts` exporting nothing, with three tests, two of them `todo` until Task 6.

- [ ] **Step 1: Write the guard test** `scripts/style-rules.test.ts`:
  - `test('kovir.css uses no class selectors')`: read `src/styles/kovir.css`, strip comments and `url(...)`, then `assert.doesNotMatch(css, /(^|[\s,>+~(])\.[a-z_-]/im)`.
  - `test('.astro files use only documented TagBrush classes', { todo: 'Task 6' })`: for every `src/**/*.astro`, collect `class="…"` and `class:list` string literals, and assert each token is in `['button','secondary','outline','container','grid','card','striped','visually-hidden']`.
  - `test('no <style> blocks in .astro files', { todo: 'Task 6' })`: `assert.doesNotMatch(source, /<style[\s>]/)` per file.
- [ ] **Step 2: Run it.** `node --test scripts/style-rules.test.ts`. Expected: FAIL, because `kovir.css` does not exist.
- [ ] **Step 3: Install and create the theme.** `npm i tagbrush@^1 tagaction@^0 && npm i -D playwright`. Create `kovir.css` with the Global Constraints variables in `:root { … light-dark(light, dark) }`, `--font-family-*`, and `--hero-background` as a `color-mix()` of `--color-background` with `#2a5657` at 18%. Wire the imports in `Base.astro` as in Interfaces.
- [ ] **Step 4: Run** `npm test`. Expected: all pass, with 2 todo.
- [ ] **Step 5: CSP proof (throwaway, in the scratchpad, not committed).** `npm run build`. Then serve `dist/` with a tiny Node static server that sends the exact CSP header from `netlify.toml`. With a Playwright script, load `/` and `/contact/` in chromium, firefox, and webkit, collecting `securitypolicyviolation` events and console errors. Expected: zero violations in all three, and `document.adoptedStyleSheets.length > 0` after TagAction runs. **If any engine reports a `style-src` violation from TagAction:** stop and copy TagAction's injected rules into a commented block at the end of `kovir.css`, then re-run until clean. Record the result in the commit message.
- [ ] **Step 6: Commit.** `git add package.json package-lock.json src/styles/kovir.css src/layouts/Base.astro scripts/style-rules.test.ts && git commit -m "feat(style): add TagBrush, TagAction and the Kovir theme"`

### Task 2: Layout, header, footer

**Files:**
- Modify: `src/layouts/Base.astro`, `src/components/Header.astro`, `src/components/Footer.astro`, `src/styles/kovir.css`

**Interfaces:**
- Produces: `Base` named slot `hero`, rendered inside `<header>` after `<Header />`'s `<nav>`. Pages pass `<Fragment slot="hero">…</Fragment>`. `Header.astro` now renders only the `<nav>` (`Base` owns `<header>`). `Footer.astro` renders the `<footer>` element itself as a direct child of `<body>`.

- [ ] **Step 1: Rewrite the markup** per spec §3 "Layout":
  - Header: `<nav>` with a home link around the logo `<picture>` (alt "Kovir Labs"), then `<ul>` with Projects, Ideas, About, and `<a class="button" href="/contact">Contact</a>`. Remove `current()`/`aria-current` logic; TagAction sets it.
  - Footer: the about `<p>`, two `<nav>`s with `<h2>` + `<ul>` ("Kovir Labs": Projects, Ideas, About, Contact, Privacy; "Community": GitHub, Community forum, info@kovir.org), `© {year} Kovir LLC · kovir.org`, and "Project data updated `<time datetime={fetchedAt}>`".
  - Skip link: `<a class="visually-hidden" href="#main">`.
  - Delete the `<style>` blocks in all three files.
- [ ] **Step 2: Add `kovir.css` rules:** logo height (`body > header nav > a:first-child img { height: 2.3rem; width: auto }`), and the skip link visible on `:focus`.
- [ ] **Step 3: Verify.** `npm run build`, `astro preview`, and in the browser at 1280px and 375px in both schemes: the nav is one row on desktop and wraps cleanly on a phone; on `/projects`, Projects has `aria-current="page"` (set by TagAction); the footer shows two columns on desktop.
- [ ] **Step 4: Commit.** `feat(style): semantic layout, header and footer`

### Task 3: Badge tones, project card, home page

**Files:**
- Create: `src/lib/tones.ts`, `src/lib/tones.test.ts`
- Modify: `src/components/ProjectCard.astro`, `src/components/KovirBand.astro`, `src/pages/index.astro`, `src/styles/kovir.css`
- Delete: `src/components/SupportBadge.astro`, `src/components/ReleaseBadge.astro`, `src/components/PlatformList.astro`

**Interfaces:**
- Produces:
  - `type Tone = 'success' | 'info' | 'warning' | 'neutral'`
  - `supportTone(s: Support): { tone: Tone; label: string }`
  - `ideaTone(s: IdeaStatus): { tone: Tone; label: string }` (used in Task 5)
  - `releaseLine(r: { tag: string; publishedAt: string } | null): { tag: string; date: string; iso: string } | null`
- `ProjectCard` props are unchanged: `{ view: ProjectView; icon?: ImageMetadata; compact?: boolean }`.

- [ ] **Step 1: Write failing tests** in `tones.test.ts`:
  - `supportTone('official')` deep-equals `{ tone: 'success', label: 'Officially supported' }`
  - `supportTone('incubating')` → `{ tone: 'info', label: 'Incubating' }`
  - `supportTone('lab')` → `{ tone: 'neutral', label: 'From the lab' }`
  - `ideaTone`: under-review → info "Under review"; accepted → success "Accepted"; in-progress → warning "In progress"; shipped → success "Shipped"; not-now → neutral "Not now"
  - `releaseLine(null) === null`
  - `releaseLine({ tag: 'v1.2.0', publishedAt: '2026-11-01T12:00:00Z' })` → `{ tag: 'v1.2.0', date: '1 Nov 2026', iso: '2026-11-01T12:00:00Z' }` (use `formatUpdated` from `snapshot.ts`)
- [ ] **Step 2: Run** `node --test src/lib/tones.test.ts`. Expected: FAIL, module not found.
- [ ] **Step 3: Implement `tones.ts`.** Copy the labels from today's `SupportBadge.astro` and `ideas.astro`, and check they match the test.
- [ ] **Step 4: Run** `npm test`. Expected: PASS.
- [ ] **Step 5: Rewrite `ProjectCard.astro`** to the spec §3 card structure:
  - `<mark data-tone={supportTone(...).tone}>`
  - footer: `releaseLine` → `<data value={tag}>{tag}</data> · <time datetime={iso}>{date}</time>`, or "No release yet"
  - platforms joined from `PLATFORM_LABEL`
  - `data-category` and `data-platforms` kept on `<article>`
  - monogram: `<span aria-hidden="true">` when there is no icon
- [ ] **Step 6: Rewrite `index.astro` and `KovirBand.astro`** per spec §3 "Home":
  - hero via `<Fragment slot="hero">`
  - project sections as `<section>` + `<article>`s with no wrapper divs
  - `#how-it-works` with three `<article>`s using `<hgroup><p>n</p><h3>…</h3></hgroup>`
  - `#kovir-band` with a `<header>` row
- [ ] **Step 7: Add `kovir.css` rules** (each commented):
  - icon and monogram size: 56px, or 44px inside `#from-the-lab`; give the From-the-lab section that id
  - whole-card link overlay and the `:has(a:focus-visible)` ring on `main article`
  - `mark[data-tone="success"]` in Kovir teal with a gold border, and `[data-tone="info"]` outlined in `--color-highlight`
  - the teal band background for `#how-it-works` and `#kovir-band`, with overridden `--color-text-muted` (`#dcd6cc` dark / `#5c5852` light) and `--color-highlight` (`#f3c93a` dark / `#8d440f` light)
  - `h1 em` accent color
- [ ] **Step 8: Verify.** `npm run build`. Browser at 1280px and 375px, light and dark:
  - the hero looks like the current site (eyebrow, two-line heading, two buttons)
  - featured cards sit in a grid, and clicking anywhere on a card opens the project
  - the band text is readable in light mode (Review Focus 2)
  - a project with no icon shows a monogram (Review Focus 4)
- [ ] **Step 9: Commit.** `feat(style): home page and project cards on TagBrush`

### Task 4: Projects, repository table, project page, `site.ts`

**Files:**
- Create: `src/scripts/site.ts`
- Modify: `src/pages/projects/index.astro`, `src/pages/projects/[slug].astro`, `src/components/RepoList.astro`, `src/components/DownloadButtons.astro`, `src/pages/contact.astro` (script import only)
- Delete: `src/scripts/project-filter.ts`, `src/scripts/contact-form.ts`

**Interfaces:**
- Consumes: `matches(item, f: Filter)` from `src/lib/project-filter.ts`; `prefill(search, slugs)` from `src/lib/contact-prefill.ts`; `RepoRow` from `src/lib/all-repos.ts` (unchanged).
- Produces: `site.ts` runs on any page and acts only if it finds `search#project-filter` or `form#contact-form`. Both pages import it with `<script>import '../../scripts/site.ts';</script>` (adjust the path per page).

- [ ] **Step 1: Write `site.ts`.** Merge the two old scripts' logic unchanged, except:
  - the filter root is `search#project-filter`; it reveals with `hidden = false`
  - the count goes in its `<output>`
  - cards are `main article[data-category]`, and groups are `main section:has(> article[data-category])`
- [ ] **Step 2: Rewrite `/projects`** per spec §3: header and lede, `<search id="project-filter" hidden>` with labelled `<select name="category">`, `<select name="platform">`, and `<output>`; then the support group sections, the `#no-match` `<p hidden>`, and `#all-repositories`.
- [ ] **Step 3: Rewrite `RepoList.astro`** as `<search><input type="search" aria-label="Filter repositories" aria-controls="repo-table"></search>` plus `<table id="repo-table">` with columns Repository, Description, Language, Updated (`<time datetime={updatedIso}>`), Status (`<mark data-tone="success"><a href={projectHref}>Project page</a></mark>` or `<mark data-tone="neutral">Not reviewed</mark>`), and a "Fork" note after the name.
- [ ] **Step 4: Rewrite `[slug].astro` and `DownloadButtons.astro`** per spec §3 "Project detail":
  - `<article>`, with `<hgroup>`, the support `<mark>`, and `<time data-tag-time="relative">` for the release
  - downloads: `<div role="group">` with the first link `button` and the rest `button secondary`
  - screenshots: `<figure><a href={full}><img></a><figcaption>`
  - community links as a `<ul>`
  - the feature/problem links: `<div role="group">` of `button outline`
- [ ] **Step 5: Verify.** `npm test && npm run check && npm run build`. In the browser:
  - the category and platform filter hides and shows cards and groups, and the count updates
  - typing "tag" in the repository filter leaves only the tag* rows
  - clicking the "Updated" header sorts the table (`aria-sort` set)
  - a screenshot opens in TagAction's viewer
  - at 375px there is no page-level sideways scroll; the table scrolls inside itself (Review Focus 3)
  - with JavaScript disabled (Playwright `javaScriptEnabled: false`), all cards are listed and the filter stays hidden (Review Focus 1)
- [ ] **Step 6: Commit.** `feat(style): projects, repository table and project pages on TagBrush`

### Task 5: Ideas and contact

**Files:**
- Modify: `src/pages/ideas.astro`, `src/components/IdeaList.astro`, `src/pages/contact.astro`, `src/pages/contact/thanks.astro`

**Interfaces:**
- Consumes: `ideaTone` (Task 3), `IdeaView` from `src/lib/ideas.ts`, and `site.ts` (Task 4).

- [ ] **Step 1: Rewrite `IdeaList.astro`** as a `<table>` with columns Idea (link), Upvotes (`<data value>`), Comments (`<data value>`), and Status (`<mark data-tone={ideaTone(status).tone}>`). The empty state is a plain `<p>`. The ideas page uses `<div role="group">` for its CTAs.
- [ ] **Step 2: Rewrite `contact.astro`** as `<article><form id="contact-form" …>` with every Netlify attribute, the honeypot, the hidden `form-name`, `action`, and `data-slugs` copied unchanged. Use labels with `for`, help text in `<small>`, and `required`/`type="email"` as today. Rewrite `thanks.astro` as `<article>` prose.
- [ ] **Step 3: Verify.** `npm run build`, then in the browser on `/contact`:
  - submitting empty shows text errors under the fields with `aria-invalid="true"`
  - `/contact?type=idea&project=toril` preselects both
  - an unknown `project=` value leaves the select at its default
  - with JavaScript off the form still has native required validation and posts (Review Focus 1)
  - `/ideas` with zero discussions shows the empty `<p>`, and an idea with no status label shows "Under review" (Review Focus 5, covered by the `ideaTone` test plus `toIdeaViews`'s default)
- [ ] **Step 4: Commit.** `feat(style): ideas and contact pages on TagBrush`

### Task 6: Remaining pages and removal of the old styles

**Files:**
- Modify: `src/pages/about.astro`, `src/pages/privacy.astro`, `src/pages/404.astro`, `src/layouts/Base.astro`, `scripts/style-rules.test.ts`
- Delete: `src/styles/global.css`

- [ ] **Step 1: Turn on the two `todo` guard tests** in `style-rules.test.ts` (remove `todo`).
- [ ] **Step 2: Run** `npm test`. Expected: FAIL, listing each remaining invented class or `<style>` block.
- [ ] **Step 3: Rewrite** about, privacy, and 404 as `<article>` prose (`.lede` becomes an `<hgroup>` subtitle; About reuses `KovirBand`). Delete `global.css` and its import from `Base.astro`. Fix every file the guard listed.
- [ ] **Step 4: Run** `npm test && npm run check && npm run build`. Expected: all pass, 0 todo.
- [ ] **Step 5: Verify** every page in the browser at 1280px and 375px in both schemes against the live site for visual parity: palette, fonts, logo, band, and cards.
- [ ] **Step 6: Commit.** `refactor(style): remove global.css; every page on TagBrush`

### Task 7: TagCheck gates CI and deploys

**Files:**
- Modify: `package.json`, `.github/workflows/deploy.yml`, plus any page TagCheck flags

**Interfaces:**
- Produces: `npm run tagcheck` exits 0 only when TagCheck reports 0 errors and 0 warnings.

- [ ] **Step 1: Add** the devDep `@kovirlabs/tagcheck` and the script `"tagcheck": "tagcheck dist --strict --browser"`. Run `npx playwright install chromium`.
- [ ] **Step 2: Run** `npm run build && npm run tagcheck -- --json`. Check that the report says `"browser": true` and has no `not-loaded` warnings. **If `not-loaded` appears** because `/_astro/` paths don't resolve from a folder, change the script to `"tagcheck": "node scripts/tagcheck-preview.ts"`. That file starts `astro preview --port 4329`, waits for it, runs `tagcheck http://localhost:4329/ … --strict --browser` over every built route (derived from `dist/**/index.html`), stops the server, and exits with TagCheck's code.
- [ ] **Step 3: Fix every finding** in the markup, or in `kovir.css` for contrast, until the report shows `errors: 0, warnings: 0`. Do not use `--ignore`.
- [ ] **Step 4: Wire CI.** In `deploy.yml`, in both `fallback-build` and `deploy`, after `npm run build`, add `- run: npx playwright install --with-deps chromium` then `- run: npm run tagcheck`.
- [ ] **Step 5: Verify.** `npm test && npm run check && npm run build && npm run tagcheck`. All exit 0.
- [ ] **Step 6: Commit and open the PR.** Commit `ci: gate PRs and deploys on TagCheck --strict --browser`. Push `restyle-tagstack` and open one PR to `main` with before and after screenshots (home, /projects, a project page, contact; light and dark). Confirm the PR's `fallback-build` check passes.
