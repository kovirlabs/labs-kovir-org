# CLAUDE.md

Guidance for Claude Code (claude.ai/code) in this repo.

## Project

`labs.kovir.org`, the site for **Kovir Labs**, the development arm of Kovir LLC. It is a companion
to `www.kovir.org` (repo `kovirlabs/kovir-org`). It catalogs the public projects in
<https://github.com/kovirlabs>, shows the community idea board from GitHub Discussions in
`kovirlabs/community`, and takes contact form submissions through Netlify Forms.

The design is in `docs/superpowers/specs/2026-10-25-labs-kovir-org-design.md`, and the
implementation plan is in `docs/superpowers/plans/`. `BRAND.md` is the design authority.

## Commands

- `npm run dev`: dev server at `localhost:4321`. Use `astro dev --background` for a background
  server, and manage it with `astro dev stop`, `astro dev status`, and `astro dev logs`.
- `npm run build`: static build to `./dist/`.
- `npm run check`: type-check `.astro` files and validate content frontmatter.
- `npm test`: unit tests with Node's built-in runner (`src/**/*.test.ts`, `scripts/**/*.test.ts`).
  TypeScript runs directly, with no test dependencies.
- `npm run refresh`: pull GitHub data into `src/data/github-snapshot.json`. It needs
  `GITHUB_TOKEN`; locally use `GITHUB_TOKEN=$(gh auth token) npm run refresh`. With no token or
  when GitHub is down, it keeps the committed snapshot and exits 0. If a curated repo no longer
  exists, it exits 1.
- `npm run catalog`: warns about public org repos that have no project file.

Requires Node `>=22.23.4`, Astro's floor.

## Conventions

- **`src/lib/` is pure TypeScript.** It must not import Astro, so `node --test` can run it.
  `project-data.ts` is the one exception: it reads `astro:content` and is not unit-tested.
- TypeScript must be erasable-only so Node can run it directly. That means no `enum`, no
  `namespace`, and no parameter properties. Relative imports include the `.ts` extension.
- **Projects** are Markdown files in `src/content/projects/`, and the filename is the URL
  (`/projects/<slug>`). The frontmatter schema is in `src/content.config.ts`.
  - `support` is decided by the **kovir.org team**:
    - `official`: adopted, supported, and maintained by Kovir.
    - `incubating`: being evaluated, with no support promise.
    - `lab`: an experiment.
  - `featured` requires `official`, and `official` requires `supportedSince`.
  - Never list a private repo.
- **GitHub data** comes from one GraphQL request (`src/lib/github-query.ts`). It is written to the
  committed snapshot, and pages render from the snapshot only. CI refreshes it on every deploy and
  daily.
- **Ideas** are GitHub Discussions in the `Ideas` category of `kovirlabs/community`. Their status
  comes from the labels `status: under-review|accepted|in-progress|shipped|not-now`.
- **The CSP is strict** (`netlify.toml`). That rules out inline `style=` attributes, executable
  inline `<script>`, and third-party requests: no analytics, reCAPTCHA, or external fonts. Client
  code lives in `src/scripts/*.ts` and is imported from a `<script>` tag so Astro bundles it as a
  file.
- Fonts are self-hosted with `@fontsource`: Manrope for headings, Inter for body text, and
  JetBrains Mono for versions and labels.
- The footer reads `© <year> Kovir LLC` and links to www.kovir.org.
- Deploys run from `.github/workflows/deploy.yml` to the Netlify site `kovir-labs` on push to
  `main` and daily at 06:00 UTC. They need the repo secrets `NETLIFY_AUTH_TOKEN` and
  `NETLIFY_SITE_ID`.
