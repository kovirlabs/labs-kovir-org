# labs.kovir.org Implementation Plan

> **For agentic workers:** REQUIRED SUB-SKILL: Use superpowers:subagent-driven-development (recommended) or superpowers:executing-plans to implement this plan task-by-task. Steps use checkbox (`- [ ]`) syntax for tracking.

**Goal:** Build and deploy `labs.kovir.org`, a static Astro site that catalogs Kovir Labs projects,
shows the community idea board from GitHub Discussions, and takes contact form submissions.

**Architecture:**
- Curated Markdown project files are enriched at build time from one GitHub GraphQL request. Its
  result is written to a committed snapshot, which is the fallback whenever GitHub is unavailable.
- All data shaping happens in small, pure TypeScript modules under `src/lib/`, which are
  unit-tested. Astro pages only render the view models those modules return.
- The site deploys to Netlify from GitHub Actions on push and on a daily schedule.

**Tech Stack:**
- Astro 7, static output, TypeScript strict.
- Node `>=22.18.0`, running `.ts` directly; tests use `node --test`.
- `@fontsource` fonts, Netlify Forms, GitHub GraphQL API, GitHub Discussions.

**Spec:** `docs/superpowers/specs/2026-10-25-labs-kovir-org-design.md`. It moves into the new repo
in Task 1.

## Global Constraints

- New repo `kovirlabs/labs-kovir-org`, local path `~/github/labs-kovir-org`, default branch `main`.
- `package.json` sets `"engines": { "node": ">=22.18.0" }`. CI uses Node 24.
- Dependencies are exactly `astro`, `@astrojs/sitemap`, `@fontsource/inter`,
  `@fontsource/manrope`, and `@fontsource/jetbrains-mono`. Dev dependencies are `@astrojs/check`
  and `typescript`. There is no Octokit, no YAML library, and no UI framework. Call GitHub with
  plain `fetch`.
- TypeScript must be erasable-only so Node can run it directly. That means no `enum`, no
  `namespace`, and no parameter properties. Relative imports include the `.ts` extension.
- No third-party requests from the browser: no analytics, no reCAPTCHA, no external fonts, and no
  cookies.
- The CSP is `default-src 'self'; img-src 'self' data:; style-src 'self'; script-src 'self';
  form-action 'self'; frame-ancestors 'none'; base-uri 'self'`. Because of it, there are no inline
  `style=` attributes, and the build must produce no executable inline `<script>`. JSON-LD
  (`application/ld+json`) is allowed.
- The footer reads `© <current year> Kovir LLC`, and every page links back to `https://www.kovir.org`.
- Contact routes are `info@kovir.org`, the forum `https://github.com/kovirlabs/community/discussions`,
  and `/contact`.
- Support levels are exactly `official` · `incubating` · `lab`. Statuses are exactly `stable` ·
  `beta` · `pre-release` · `archived`.
- Idea status labels are exactly `status: under-review`, `status: accepted`, `status: in-progress`,
  `status: shipped`, and `status: not-now`. Source labels are `source: form` and
  `source: kovir-client`.
- Private repos are never fetched by name, listed, or mentioned on the site.
- Palette tokens are teal `#3A787A`, dark teal `#2A5657`, gold `#DFAD05`, rust `#8D440F`, coral
  `#FC7A57`, eggshell `#F1EEE9`, and charcoal `#323232`. Headings use Manrope, body text uses Inter,
  and versions and labels use JetBrains Mono.
- Steps that create things outside this machine need Evan's go-ahead at execution time. They are
  marked **(outward)**: creating GitHub repos, labels and settings, the Netlify site, DNS, and
  posting to kovir-org.

## Review Focus

1. **Release assets with nothing installable.** A release may hold only `.sig` files,
   `latest.json`, updater `.app.tar.gz` bundles, or HTML. A visitor should see no download buttons
   and fall through to the website or repo action, never a broken button. The test is in Task 3.
2. **An idea with several or unknown labels.** A discussion labeled both `status: accepted` and
   `status: shipped`, or with an unrecognized status label, should show once under the most
   advanced status. With no recognized status label it counts as under review. The test is in
   Task 4.
3. **A project file added before the snapshot has its data.** For example, the refresh failed that
   day. The page should still render, with "No release yet" and no stars, not crash the build. The
   test is in Task 3.
4. **A closed discussion with no status label.** This is usually spam or a duplicate, and it should
   be hidden from the idea board, not shown as under review. The test is in Task 4.
5. **A tampered or stale contact link,** such as `/contact?type=idea&project=not-a-project`. The
   form should ignore the unknown project and still preselect the valid type. The test is in
   Task 9.

---

## File Structure

```
labs-kovir-org/
├─ astro.config.mjs                 # site, sitemap, inlineStylesheets:'never', assetsInlineLimit:0
├─ netlify.toml                     # build + security headers
├─ package.json  tsconfig.json  .gitignore  README.md  CLAUDE.md  BRAND.md
├─ docs/superpowers/{specs,plans}/  # spec + this plan (moved from kovir-org)
├─ .github/workflows/deploy.yml
├─ scripts/
│  ├─ refresh-github.ts             # CLI: read curated repos → refresh() → write snapshot
│  └─ check-catalog.ts              # CLI: warn on uncataloged public repos
├─ public/  favicon.svg  logo-labs-dark.svg  logo-labs-light.svg  og-default.png  robots.txt
└─ src/
   ├─ content.config.ts             # `projects` collection
   ├─ content/projects/*.md         # toril, tenajlo, nu, first-principles-code, sonome
   ├─ data/github-snapshot.json     # committed snapshot
   ├─ assets/projects/<slug>/       # icon.png, screenshots
   ├─ lib/
   │  ├─ types.ts                   # shared data types (no logic)
   │  ├─ github-query.ts            # buildQuery(), normalize()
   │  ├─ refresh.ts                 # refresh(): fetch + fallback rules
   │  ├─ curated-repos.ts           # readCuratedRepos(): frontmatter `repo:` lines
   │  ├─ catalog.ts                 # uncataloged()
   │  ├─ downloads.ts               # downloadsFromAssets()
   │  ├─ project-rules.ts           # projectRuleErrors()
   │  ├─ projects.ts                # toProjectView(), sortProjects(), groupBySupport()
   │  ├─ ideas.ts                   # ideaStatus(), toIdeaViews(), groupIdeas(), topIdeas()
   │  ├─ contact-prefill.ts         # prefill()
   │  ├─ snapshot.ts                # loadSnapshot(), formatUpdated()
   │  ├─ __fixtures__/graphql-ok.json, graphql-partial.json
   │  └─ *.test.ts                  # next to each module
   ├─ layouts/Base.astro
   ├─ components/  Header Footer ProjectCard SupportBadge ReleaseBadge PlatformList
   │               DownloadButtons IdeaList KovirBand
   ├─ scripts/  nav.ts  project-filter.ts  contact-form.ts   # bundled client scripts
   ├─ styles/global.css
   └─ pages/  index  projects/index  projects/[slug]  ideas  contact  about  privacy  404
```

---

### Task 1: Bootstrap the repo

**Files:**
- Create: everything at the repo root listed above except `netlify.toml`, the workflow, and
  `BRAND.md`.
- Create: `src/pages/index.astro` (placeholder), `src/lib/smoke.test.ts`.
- Move: the spec and this plan from `~/github/kovir-org/docs/superpowers/` into
  `docs/superpowers/` in the new repo.

**Interfaces:** Produces the npm scripts every later task uses:
- `dev`: `astro dev`
- `build`: `astro build`
- `preview`: `astro preview`
- `check`: `astro check`
- `test`: `node --test 'src/**/*.test.ts' 'scripts/**/*.test.ts'`
- `refresh`: `node scripts/refresh-github.ts`
- `catalog`: `node scripts/check-catalog.ts`

- [ ] **Step 1:** Run `npm create astro@latest labs-kovir-org -- --template minimal --typescript strict --no-install --no-git` in `~/github`.
- [ ] **Step 2:** Edit the project files.
  - `package.json`: set the scripts, engines, and dependencies from the Global Constraints. Then
    run `npm install`.
  - `tsconfig.json`: extend `astro/tsconfigs/strict`, and add
    `"compilerOptions": { "allowImportingTsExtensions": true, "erasableSyntaxOnly": true }`.
  - `astro.config.mjs`:
    - `site: 'https://labs.kovir.org'` and `integrations: [sitemap()]`
    - `build: { inlineStylesheets: 'never' }`
    - `vite: { build: { assetsInlineLimit: 0 } }`
- [ ] **Step 3:** Write the `src/lib/smoke.test.ts` test with
  `test('runner works', () => assert.equal(1 + 1, 2))`. Then run `npm test`. Expected: 1 pass.
- [ ] **Step 4:** Write `CLAUDE.md`, modeled on kovir-org's. It covers the commands, the
  `src/lib` purity rule (no Astro imports in `src/lib`), the snapshot fallback, the support-level
  meanings, and the CSP constraints.
  - Write `README.md` with a one-paragraph description and the commands.
  - `.gitignore`: `node_modules`, `dist`, `.astro`, `.env`.
- [ ] **Step 5:** Move the spec and plan in. Then `git init -b main`, `git add -A`, and commit
  with `chore: scaffold labs.kovir.org`.
- [ ] **Step 6 (outward):** `gh repo create kovirlabs/labs-kovir-org --public --source . --push`.
- [ ] **Step 7:** In `~/github/kovir-org`, delete the moved spec and plan from the working tree.
  They were never committed there.

### Task 2: GitHub query and normalization

**Files:**
- Create: `src/lib/types.ts`, `src/lib/github-query.ts`
- Create: `src/lib/__fixtures__/graphql-ok.json`, `src/lib/__fixtures__/graphql-partial.json`
- Test: `src/lib/github-query.test.ts`

**Interfaces:** Produces these types in `types.ts`:

```ts
export type Asset = { name: string; url: string };
export type ReleaseFacts = { tag: string; publishedAt: string; url: string; assets: Asset[] };
export type RepoFacts = {
  fullName: string; url: string; description: string | null; stars: number;
  license: string | null; topics: string[]; pushedAt: string; archived: boolean;
  hasContributing: boolean; hasCodeOfConduct: boolean; hasSecurityPolicy: boolean;
  latestRelease: ReleaseFacts | null;
};
export type IdeaFacts = {
  number: number; title: string; url: string; category: string; labels: string[];
  upvotes: number; comments: number; createdAt: string; updatedAt: string; closed: boolean;
};
export type Snapshot = {
  fetchedAt: string | null; repos: Record<string, RepoFacts>;
  ideas: IdeaFacts[]; publicRepos: string[];
};
export type Normalized = {
  repos: Record<string, RepoFacts>; ideas: IdeaFacts[] | null; publicRepos: string[] | null;
  missing: string[];      // curated repos GitHub reported NOT_FOUND
  failed: string[];       // curated repos that errored for any other reason
};
```

`github-query.ts` exports:
- `FORUM_REPO = 'kovirlabs/community'` and `ORG = 'kovirlabs'`
- `buildQuery(repos: string[]): { query: string; aliases: Record<string, string> }`. Aliases are
  `r0`, `r1`, and so on, each mapped to its `owner/name`.
- `normalize(json: unknown, aliases: Record<string, string>): Normalized`

The query has one aliased `repository(owner, name)` block per curated repo, plus a `forum:`
repository block and an `org:` block. The field list is fixed:

```graphql
r0: repository(owner: "kovirlabs", name: "toril") {
  nameWithOwner url description stargazerCount pushedAt isArchived isSecurityPolicyEnabled
  licenseInfo { spdxId }
  repositoryTopics(first: 20) { nodes { topic { name } } }
  contributingGuidelines { url }
  codeOfConduct { url }
  latestRelease { tagName publishedAt url releaseAssets(first: 50) { nodes { name downloadUrl } } }
}
forum: repository(owner: "kovirlabs", name: "community") {
  discussions(first: 100, orderBy: { field: UPDATED_AT, direction: DESC }) {
    nodes { number title url closed createdAt updatedAt upvoteCount
            category { name } labels(first: 10) { nodes { name } } comments { totalCount } }
  }
}
org: organization(login: "kovirlabs") {
  repositories(first: 100, privacy: PUBLIC) { nodes { nameWithOwner isArchived } }
}
```

- [ ] **Step 1: Write the fixtures.**
  - `graphql-ok.json` has two repos. `r0` is Toril with the real asset names from v1.1.1:
    `.msi`, `-setup.exe`, two `.dmg`, `.AppImage`, `.deb`, `.rpm`, the `.sig` files,
    `latest.json`, and the `.app.tar.gz` bundles. `r1` is Nu with `latestRelease: null` and
    `licenseInfo.spdxId` set to `GPL-3.0`. It also has four forum discussions and three org repos,
    one of them archived.
  - `graphql-partial.json` has `data.r1: null` with
    `errors: [{ type: 'NOT_FOUND', path: ['r1'] }]`, `data.r2: null` with
    `errors: [{ type: 'FORBIDDEN', path: ['r2'] }]`, and `data.forum: null`.
- [ ] **Step 2: Write the failing tests.**
  - `buildQuery(['kovirlabs/toril','kovirlabs/nu'])` returns aliases
    `{ r0: 'kovirlabs/toril', r1: 'kovirlabs/nu' }`. Its query contains `r1: repository(owner: "kovirlabs", name: "nu")`, `forum:`, and `org:`.
  - Repo names that do not match `^[\w.-]+/[\w.-]+$` throw.
  - `normalize(ok)`:
    - `repos['kovirlabs/toril'].stars` is the fixture number.
    - `topics` is a string array.
    - `latestRelease.assets` has the fixture length, mapped from `{ name, url: downloadUrl }`.
    - Nu has `latestRelease === null` and `license === 'GPL-3.0'`.
    - `ideas` has length 4, with `labels` as string arrays and `category` as a string.
    - `publicRepos` holds only the two non-archived `nameWithOwner` values. Archived repos are
      dropped here.
    - `missing` and `failed` are both `[]`.
  - `normalize(partial)` gives `missing: ['kovirlabs/nu']`, `failed: ['kovirlabs/x']`, and
    `ideas: null`, and does not throw.
- [ ] **Step 3:** Run `npm test`. Expected: FAIL, the module is not found.
- [ ] **Step 4:** Implement `buildQuery` and `normalize`. Interpolate repo names only after the
  regex check.
- [ ] **Step 5:** Run `npm test`. Expected: PASS.
- [ ] **Step 6:** Commit with `feat: GitHub GraphQL query and normalization`.

### Task 3: Projects — schema, downloads, view models, content

**Files:**
- Create: `src/lib/downloads.ts`, `src/lib/project-rules.ts`, `src/lib/projects.ts`,
  `src/content.config.ts`, `src/content/projects/{toril,tenajlo,nu,first-principles-code,sonome}.md`,
  `src/assets/projects/<slug>/`
- Test: `src/lib/downloads.test.ts`, `src/lib/project-rules.test.ts`, `src/lib/projects.test.ts`

**Interfaces:**
- Consumes `RepoFacts` and `Asset` from Task 2.
- Produces:

```ts
// downloads.ts
export type Download = { platform: 'windows' | 'macos' | 'linux'; label: string; url: string; primary: boolean };
export function downloadsFromAssets(assets: Asset[]): Download[];
// project-rules.ts
export type Support = 'official' | 'incubating' | 'lab';
export function projectRuleErrors(d: { support: Support; featured: boolean; supportedSince?: Date }): string[];
// projects.ts
export type ProjectEntry = {  // collection data + slug, images already resolved by Astro
  slug: string; name: string; repo: string; tagline: string; audience: string;
  support: Support; status: 'stable' | 'beta' | 'pre-release' | 'archived';
  supportedSince?: Date; featured: boolean; order: number;
  category: 'desktop-app' | 'library' | 'education' | 'tooling';
  platforms: ('windows' | 'macos' | 'linux' | 'web' | 'python')[];
  website?: string; docs?: string; forkOf?: string; ideas: number[];
};
export type PrimaryAction = { kind: 'download' | 'website' | 'repo'; url: string; label: string };
export type ProjectView = ProjectEntry & {
  repoUrl: string; stars: number | null; license: string | null; topics: string[];
  release: { tag: string; publishedAt: string; url: string } | null;
  downloads: Download[]; primaryAction: PrimaryAction;
  community: { contributing: boolean; codeOfConduct: boolean; securityPolicy: boolean } | null;
};
export function toProjectView(entry: ProjectEntry, facts: RepoFacts | undefined): ProjectView;
export function sortProjects(views: ProjectView[]): ProjectView[];
export function groupBySupport(views: ProjectView[]): { featured: ProjectView[]; official: ProjectView[]; incubating: ProjectView[]; lab: ProjectView[] };
```

**Download mapping**, case-insensitive, by file-name suffix. Ignore anything else, including
`.sig`, `latest.json`, `.app.tar.gz`, and `.html`.

| Suffix | Platform | Label | Primary |
|---|---|---|---|
| `-setup.exe` | windows | `Windows installer` | yes |
| `.msi` | windows | `Windows (MSI)` | only if there is no `-setup.exe` |
| `.dmg` with `aarch64` or `arm64` in the name | macos | `macOS (Apple Silicon)` | yes |
| `.dmg` with `x64` or `x86_64` in the name | macos | `macOS (Intel)` | yes |
| `.AppImage` | linux | `Linux (AppImage)` | yes |
| `.deb` | linux | `Linux (.deb)` | only if there is no AppImage |
| `.rpm` | linux | `Linux (.rpm)` | no |

Output order is windows, then macos, then linux. Within a platform, primary items come first.

- [ ] **Step 1: Write the failing tests.**
  - `downloads.test.ts`:
    - Toril's asset list (from the fixture) gives exactly 7 downloads, labeled in order:
      `Windows installer`, `Windows (MSI)`, `macOS (Apple Silicon)`, `macOS (Intel)`,
      `Linux (AppImage)`, `Linux (.deb)`, `Linux (.rpm)`.
    - Primary flags are `[true,false,true,true,true,false,false]`.
    - Tenajlo's list (`.app.tar.gz`, `.sig`, `.dmg` aarch64, `.deb`, `-setup.exe`,
      `THIRD_PARTY_LICENSES.html`, `latest.json`) gives the labels `Windows installer`,
      `macOS (Apple Silicon)`, and `Linux (.deb)`. The `.deb` is primary because there is no
      AppImage.
    - **Review Focus 1:** `[{name:'latest.json'},{name:'x.sig'},{name:'App_x64.app.tar.gz'}]`
      returns `[]`.
  - `project-rules.test.ts`:
    - `{support:'lab', featured:true}` gives `['featured requires support: official']`.
    - `{support:'official', featured:false}` gives
      `['support: official requires supportedSince']`.
    - `{support:'official', featured:true, supportedSince:new Date('2026-11-01')}` gives `[]`.
  - `projects.test.ts`:
    - With Toril's facts, `primaryAction.kind` is `'download'`.
    - An entry with `website` and facts with no release gives `{kind:'website'}`.
    - With no website and no release, the result is `{kind:'repo', url:'https://github.com/kovirlabs/nu'}`.
    - Facts with `archived:true` turn `status:'stable'` into `status:'archived'`.
    - **Review Focus 3:** `toProjectView(entry, undefined)` gives `stars: null`,
      `release: null`, `downloads: []`, and `community: null`. `repoUrl` is built from `repo`,
      and the function does not throw.
    - `sortProjects` orders by `order` ascending, then by `name`.
    - In `groupBySupport`, `featured` holds only `official && featured`. With zero official
      projects, `featured` and `official` are both `[]`.
- [ ] **Step 2:** Run `npm test`. Expected: the new tests FAIL.
- [ ] **Step 3:** Implement the three modules.
- [ ] **Step 4:** Run `npm test`. Expected: PASS.
- [ ] **Step 5:** Write `src/content.config.ts`.
  - The `projects` collection uses `glob({ pattern: '*.md', base: './src/content/projects' })`.
  - Zod fields follow `ProjectEntry`, plus `icon: image().optional()`,
    `screenshots: z.array(z.object({ src: image(), alt: z.string().min(1) })).default([])`, and
    `draft: z.boolean().default(false)`.
  - `.superRefine` calls `projectRuleErrors` and adds each error as an issue.
  - Defaults: `featured` false, `ideas` `[]`.
- [ ] **Step 6:** Write the five project files.
  - Draft the tagline, audience, and a 2–5 paragraph body from each repo's README.
  - Set `support: lab` and `featured: false` on all five until the kovir.org team decides. This is
    a launch checklist item in Task 11.
  - Set `status` to: toril `stable`, tenajlo `stable`, nu `beta`, first-principles-code `stable`,
    sonome `beta`.
  - Set `website` to: toril `https://toril.ink/`, tenajlo `https://kovirlabs.github.io/tenajlo/`.
  - Set `forkOf: mu-editor/mu` on nu.
  - Copy the icons and one screenshot each from the local repos in `~/github/<repo>/`. Toril's are
    in `media/` and `docs/`.
- [ ] **Step 7:** Run `npm run check`. Expected: 0 errors.
  - Then temporarily set `featured: true` on toril. Expected: the check fails with
    `featured requires support: official`.
  - Revert the change.
- [ ] **Step 8:** Commit with `feat: projects collection, download mapping, project view models`.

### Task 4: Ideas — status and grouping

**Files:**
- Create: `src/lib/ideas.ts`
- Test: `src/lib/ideas.test.ts`

**Interfaces:**
- Consumes `IdeaFacts` (Task 2).
- Produces:

```ts
export type IdeaStatus = 'under-review' | 'accepted' | 'in-progress' | 'shipped' | 'not-now';
export type IdeaView = { number: number; title: string; url: string; upvotes: number; comments: number; updatedAt: string; status: IdeaStatus; fromForm: boolean };
export function ideaStatus(labels: string[]): IdeaStatus | null;   // null = no recognized status label
export function toIdeaViews(ideas: IdeaFacts[]): IdeaView[];        // category 'Ideas' only; drops closed+unlabeled
export function groupIdeas(views: IdeaView[]): { active: IdeaView[]; underReview: IdeaView[]; shipped: IdeaView[]; notNow: IdeaView[] };  // active = accepted + in-progress
export function topIdeas(views: IdeaView[], n: number): IdeaView[]; // open statuses only: under-review, accepted, in-progress
```

Status precedence, most advanced first, is `shipped > in-progress > accepted > not-now >
under-review`. An idea that is open and has no recognized status label is `under-review`. Every
list is sorted by `upvotes` descending, then `updatedAt` descending.

- [ ] **Step 1: Write the failing tests.**
  - `ideaStatus(['status: accepted','status: shipped'])` is `'shipped'`.
  - **Review Focus 2:** `ideaStatus(['status: maybe','bug'])` is `null`, and an open idea with
    those labels maps to `'under-review'` in `toIdeaViews`.
  - **Review Focus 4:** a closed idea with labels `[]` is absent from `toIdeaViews`. A closed idea
    with `['status: not-now']` is present with status `not-now`.
  - Ideas whose category is `'Q&A'` are dropped.
  - `fromForm` is true when the labels include `source: form`.
  - `groupIdeas` puts accepted and in-progress ideas in `active`.
  - Sorting: upvotes `[3,9,9]` with `updatedAt` `['2026-10-01','2026-10-02','2026-10-05']` come
    out in the order `9 (10-05), 9 (10-02), 3`.
  - `topIdeas(views, 3)` never includes `shipped` or `not-now` ideas, and it returns at most 3.
- [ ] **Step 2:** Run `npm test`. Expected: FAIL.
- [ ] **Step 3:** Implement the four functions.
- [ ] **Step 4:** Run `npm test`. Expected: PASS.
- [ ] **Step 5:** Commit with `feat: idea status and grouping`.

### Task 5: Refresh pipeline, snapshot, and catalog check

**Files:**
- Create: `src/lib/refresh.ts`, `src/lib/curated-repos.ts`, `src/lib/catalog.ts`,
  `src/lib/snapshot.ts`, `src/data/github-snapshot.json`
- Create: `scripts/refresh-github.ts`, `scripts/check-catalog.ts`
- Test: `src/lib/refresh.test.ts`, `src/lib/curated-repos.test.ts`, `src/lib/catalog.test.ts`,
  `src/lib/snapshot.test.ts`

**Interfaces:**
- Consumes `buildQuery` and `normalize` (Task 2) and the `Snapshot` type.
- Produces:

```ts
// refresh.ts
export type RefreshResult =
  | { kind: 'ok'; snapshot: Snapshot; warnings: string[] }
  | { kind: 'fallback'; reason: string }              // keep the file as-is, exit 0
  | { kind: 'missing'; repos: string[] };             // exit 1
export function refresh(opts: { token: string | undefined; repos: string[]; previous: Snapshot;
  fetchImpl?: typeof fetch; now?: () => Date }): Promise<RefreshResult>;
// curated-repos.ts
export function readCuratedRepos(markdownFiles: { name: string; text: string }[]): string[]; // `repo:` frontmatter line; sorted, unique
// catalog.ts
export function uncataloged(publicRepos: string[], curated: string[], ignore: string[]): string[];
// snapshot.ts
export function loadSnapshot(): Snapshot;           // imports src/data/github-snapshot.json
export function formatUpdated(fetchedAt: string | null): string | null; // '25 Oct 2026' (UTC, en-GB) or null
```

The fallback rules for `refresh`, in order:
1. If there is no token, return `fallback` with the reason `no GITHUB_TOKEN`.
2. If the network errors, the response is not 2xx, or the body has no `data`, return `fallback`.
3. If `missing` is non-empty, return `missing`.
4. Otherwise return `ok`. For each repo in `failed`, reuse `previous.repos[repo]` and add a
   warning. Reuse `previous.ideas` when `ideas` is null, and `previous.publicRepos` when
   `publicRepos` is null. Set `fetchedAt` to `now().toISOString()`.

The request is a `POST` to `https://api.github.com/graphql` with
`Authorization: bearer <token>` and `User-Agent: labs-kovir-org`.

The seed `github-snapshot.json` is
`{ "fetchedAt": null, "repos": {}, "ideas": [], "publicRepos": [] }`.

`scripts/check-catalog.ts` ignores the `kovirlabs/labs-kovir-org`, `kovirlabs/community`, and
`kovirlabs/.github` repos. Archived repos are already excluded by `normalize`.

- [ ] **Step 1: Write the failing tests.** Use an injected `fetchImpl` that returns the Task 2
  fixtures.
  - `token: undefined` gives `fallback`.
  - A fetch that throws gives `fallback`.
  - A 502 response gives `fallback`.
  - `graphql-ok` gives `ok`, with `fetchedAt` equal to the injected date.
  - `graphql-partial` gives `missing: ['kovirlabs/nu']`.
  - A partial result with only a `FORBIDDEN` error gives `ok`, with the previous facts for that
    repo, a warning that names it, and the previous ideas kept.
  - `readCuratedRepos` reads `repo: kovirlabs/toril` and `repo: "kovirlabs/nu"`, ignores a body
    line `repo: fake/x` that comes after the closing `---`, and dedupes.
  - `uncataloged(['kovirlabs/a','kovirlabs/b','kovirlabs/community'], ['kovirlabs/a'], ['kovirlabs/community'])`
    gives `['kovirlabs/b']`.
  - `formatUpdated('2026-10-25T06:00:00Z')` is `'25 Oct 2026'`, and `formatUpdated(null)` is
    `null`.
- [ ] **Step 2:** Run `npm test`. Expected: FAIL.
- [ ] **Step 3:** Implement the four modules and the seed JSON.
- [ ] **Step 4:** Run `npm test`. Expected: PASS.
- [ ] **Step 5:** Write `scripts/refresh-github.ts`.
  - It reads `src/content/projects/*.md`, runs `readCuratedRepos`, loads the current snapshot, and
    calls `refresh` with `process.env.GITHUB_TOKEN`.
  - On `ok`, it writes the snapshot as pretty JSON with a trailing newline and prints the
    warnings.
  - On `fallback`, it prints `refresh skipped: <reason>; using committed snapshot` and exits 0.
  - On `missing`, it prints
    `repo not found on GitHub: <list> — fix or remove the project file` and exits 1.
- [ ] **Step 6:** Write `scripts/check-catalog.ts`.
  - It prints `uncataloged public repos: …` as a warning, or `catalog complete`.
  - It always exits 0.
- [ ] **Step 7:** Run `GITHUB_TOKEN= npm run refresh`. Expected: the skipped message, exit 0, and
  the file unchanged.
  - Run `GITHUB_TOKEN=$(gh auth token) npm run refresh`. Expected: the snapshot fills with five
    repos and `fetchedAt` is set. Ideas stay `[]` until the community repo exists.
  - Run `npm run catalog`. Expected: it lists simpl-css, json-editor-web, and setup-hhtos.
- [ ] **Step 8:** Commit with `feat: GitHub refresh pipeline with snapshot fallback`, including
  the filled snapshot.

### Task 6: Brand, wordmark, and layout shell

**Files:**
- Create: `BRAND.md`, `src/styles/global.css`, `src/layouts/Base.astro`
- Create: `src/components/{Header,Footer,KovirBand,SupportBadge}.astro`, `src/scripts/nav.ts`
- Create: `src/pages/404.astro`
- Create: `public/{favicon.svg,logo-labs-dark.svg,logo-labs-light.svg,og-default.png,robots.txt}`

**Interfaces:**
- Consumes `loadSnapshot` and `formatUpdated` (Task 5), and `Support` (Task 3).
- Produces these props:
  - `Base`: `{ title: string; description?: string; ogImage?: ImageMetadata; jsonLd?: object }`.
    The title renders as `<title>{title} | Kovir Labs</title>`.
  - `SupportBadge`: `{ support: Support }`.
  - `KovirBand`: no props.

- [ ] **Step 1:** Write `BRAND.md` from spec 3.7.
  - Include the tokens, the dark default and light theme mapping, and the badge styles:
    - `official`: teal fill with a gold outline.
    - `incubating`: gold.
    - `lab`: neutral outline.
  - Every badge always shows its text.
  - Voice: plain, specific, and honest.
  - Mark the wordmark files as interim.
- [ ] **Step 2:** Make the interim wordmark.
  - Install the tools if needed: `brew install potrace imagemagick`.
  - Upscale `~/github/kovir-org/public/logo-navbar.png` 8x, threshold it to PBM, and run
    `potrace -s` on it. Then compose the SVG with a "Labs" Manrope text element converted to a
    path, so there is no font dependency.
  - Produce two files: `logo-labs-light.svg` with charcoal `#323232` and `logo-labs-dark.svg` with
    eggshell `#F1EEE9`.
  - The favicon is kovir-org's traced K path from `public/favicon.svg` on a `#2A5657` tile.
  - Verify: open both SVGs in a browser and compare them against the PNG at 2x. The outlines
    should match with no visible blobbing.
- [ ] **Step 3:** Write `global.css`.
  - Set the tokens on `:root` with the dark theme as the default.
  - Swap them under `@media (prefers-color-scheme: light)`.
  - Import the `@fontsource` Inter 400/700, Manrope 400/700, and JetBrains Mono 400.
  - Add the `.container` and `.btn` utilities, and set visible `:focus-visible` outlines.
- [ ] **Step 4:** Build `Base` and the components.
  - `Base` includes the canonical URL, OG tags (defaulting to `/og-default.png`), JSON-LD when
    given, and a skip link.
  - `Header`: the logo, then Projects, Ideas, About, and a Contact button. A mobile drawer runs
    from `src/scripts/nav.ts`. Without JavaScript, the nav shows as a stacked list.
  - `Footer`:
    - `© {year} Kovir LLC`
    - "Kovir Labs is the development arm of Kovir LLC", linking to https://www.kovir.org
    - links to `info@kovir.org`, GitHub, the forum, and Privacy
    - "Project data updated {date}", only when `formatUpdated` is non-null
  - `404`: links to /projects and /ideas.
- [ ] **Step 5:** Run `npm run build`. Then `grep -rL --include='*.html' 'Kovir LLC' dist` should
  print nothing.
  - Run `grep -rP '<script(?![^>]*(src=|ld\+json))' dist` and `grep -r 'style="' dist`.
    Expected: no matches for either. If Astro inlined a script, convert it to an imported module
    script.
- [ ] **Step 6:** Commit with `feat: brand tokens, interim wordmark, layout shell`.

### Task 7: Project pages and list

**Files:**
- Create: `src/pages/projects/index.astro`, `src/pages/projects/[slug].astro`
- Create: `src/components/{ProjectCard,ReleaseBadge,PlatformList,DownloadButtons}.astro`
- Create: `src/scripts/project-filter.ts`, `src/lib/project-data.ts`
- Test: `src/scripts/project-filter.test.ts`

**Interfaces:**
- Consumes `toProjectView`, `sortProjects`, and `groupBySupport` (Task 3), and `loadSnapshot`
  (Task 5).
- Produces:
  - `src/lib/project-data.ts`: `getProjectViews(): Promise<ProjectView[]>`, used by Tasks 7, 8,
    and 9. It reads `getCollection('projects')`, filters out drafts in production, and maps
    through `toProjectView` with the snapshot. This is the only `src/lib` file allowed to import
    `astro:content`, and it is not unit-tested.
  - `src/scripts/project-filter.ts`: `matches(item: { category: string; platforms: string[] }, f: { category: string | null; platform: string | null }): boolean`.

- [ ] **Step 1: Write the failing test.** In `src/scripts/project-filter.test.ts`:
  - `matches({category:'desktop-app',platforms:['windows']}, {category:null, platform:'windows'})`
    is true.
  - The same item with `{category:'library', platform:null}` is false.
  - The same item with `{category:null, platform:null}` is true.
- [ ] **Step 2:** Run `npm test` and confirm it fails. Implement `matches`, then confirm it
  passes.
- [ ] **Step 3:** Build `/projects/[slug]`.
  - Header: icon, name, tagline, `SupportBadge`, and `ReleaseBadge` (the tag, the date, a link to
    the release, or the text "No release yet. Build from source.").
  - License, and stars only when non-null.
  - `DownloadButtons` shows the primary downloads first, with an "Other downloads" list for the
    rest. When there are no downloads, show `primaryAction` as a button instead.
  - A screenshot gallery using `<Image>` from `astro:assets`, then the body via `render()`.
  - A sidebar with platforms, license, repo, website, docs, `forkOf` ("Continuation of
    mu-editor/mu"), and topics.
  - "Get involved":
    - "Request a feature" links to `/contact?type=idea&project=<slug>`.
    - Links to "Browse ideas" (/ideas) and to issues (`<repoUrl>/issues`).
    - Contributing, Code of conduct, and Security links only when `community` says they exist.
  - Linked ideas: the `ideas` numbers, each linking to `https://github.com/kovirlabs/community/discussions/<n>`.
  - `ogImage` is the first screenshot.
  - `jsonLd` is `{ '@type': 'SoftwareApplication', name, operatingSystem, softwareVersion,
    license, url, applicationCategory: 'DeveloperApplication' }`.
- [ ] **Step 4:** Build `/projects`.
  - Show sections for Official, Incubating, and From the lab, skipping any empty section.
  - Cards carry `data-category` and `data-platforms`.
  - Category and platform `<select>` filters are wired by `project-filter.ts`. They start
    `hidden` and are revealed by the script, so a visitor without JavaScript sees the full list
    and no dead controls.
- [ ] **Step 5:** Run `npm run build`.
  - `dist/projects/toril/index.html` should contain `Windows installer` and `macOS (Apple Silicon)`.
  - `dist/projects/nu/index.html` should contain `No release yet` and `Continuation of`.
  - Run the Task 6 inline-script grep again. Expected: no matches.
- [ ] **Step 6:** Commit with `feat: project list and project pages`.

### Task 8: Home page

**Files:**
- Modify: `src/pages/index.astro`
- Create: `src/components/IdeaList.astro`

**Interfaces:**
- Consumes `getProjectViews` (Task 7), `groupBySupport` (Task 3), and `toIdeaViews` and
  `topIdeas` (Task 4).
- Produces: `IdeaList` with props `{ ideas: IdeaView[]; empty: string }`. Task 9 reuses it.

- [ ] **Step 1:** Build the home page in this order:
  1. Hero. The line is "Open software for mission-driven work. Built once, useful to many
     organizations." The buttons are "Browse projects" (/projects) and "Suggest an idea" (/ideas).
  2. A featured grid of `groupBySupport().featured`, **rendered only when non-empty**.
  3. "From the lab": the incubating and lab projects as compact cards.
  4. "How ideas become software": Suggest (anyone), then Kovir decides (the kovir.org team chooses
     what Labs adopts), then Labs builds and supports. Link /ideas and /about.
  5. "Top ideas right now": `IdeaList` with `topIdeas(…, 3)` and the empty text "No ideas yet. Be
     the first to suggest one."
  6. `KovirBand`.
- [ ] **Step 2:** Run `npm run build`.
  - With every project set to `support: lab`, `dist/index.html` has no featured-grid element and
    has the "From the lab" heading.
  - Temporarily make Toril `official` and featured with a `supportedSince`. Rebuild and confirm
    the grid appears.
  - Revert the change.
- [ ] **Step 3:** Commit with `feat: home page`.

### Task 9: Community forum, Ideas page, and Contact

**Files:**
- Create in the new repo `kovirlabs/community`: `README.md`, `CODE_OF_CONDUCT.md`,
  `.github/DISCUSSION_TEMPLATE/ideas.yml`.
- Create here: `src/pages/ideas.astro`, `src/pages/contact.astro`, `src/lib/contact-prefill.ts`,
  `src/scripts/contact-form.ts`
- Test: `src/lib/contact-prefill.test.ts`

**Interfaces:**
- Consumes `IdeaList` (Task 8), `toIdeaViews` and `groupIdeas` (Task 4), and `getProjectViews`
  (Task 7).
- Produces:
  - `prefill(search: string, slugs: string[]): { type?: 'idea' | 'question' | 'problem' | 'other'; project?: string }`
  - The Netlify form named `contact`, with fields `name`, `email`, `organization`, `type`,
    `project`, `message`, `public_ok`, and the honeypot `bot-field`.

- [ ] **Step 1 (outward):** Set up the forum repo.
  - Run `gh repo create kovirlabs/community --public`, then turn on Discussions with
    `gh repo edit kovirlabs/community --enable-discussions`.
  - Create the seven labels from the Global Constraints with `gh label create`.
  - **Manual in the GitHub UI**, because the API cannot create categories:
    - Create the categories Ideas (open format), Q&A (answer format), Announcements (maintainers
      only), and Show and tell.
    - Point org-level Discussions at this repo under org Settings, then Discussions.
- [ ] **Step 2:** Write the `community` repo files.
  - `ideas.yml`: a form with required textareas "What problem are you running into?", "Who has
    this problem?", and "How do you handle it today?", plus a dropdown "How many organizations
    like yours face this?" with the options `Just us` · `A few` · `Many`.
  - `README.md`: explain the process in the same wording as the /ideas page, define the label
    meanings, and say that the kovir.org team reviews ideas monthly.
  - Commit and push. Then seed two or three real ideas from Evan.
- [ ] **Step 3: Write the failing tests.** In `contact-prefill.test.ts`:
  - `prefill('?type=idea&project=toril', ['toril'])` is `{type:'idea', project:'toril'}`.
  - **Review Focus 5:** `prefill('?type=idea&project=not-a-project', ['toril'])` is
    `{type:'idea'}`.
  - `prefill('?type=hack', [])` is `{}`.
  - `prefill('', [])` is `{}`.
- [ ] **Step 4:** Confirm the tests fail, implement `prefill`, then confirm they pass.
- [ ] **Step 5:** Build `/ideas`.
  - Intro copy from spec 3.5, including "Being accepted is a commitment. It is not a delivery
    date."
  - The button "Post on the forum" links to
    `https://github.com/kovirlabs/community/discussions/new?category=ideas`.
  - "No GitHub account? Use the form" links to `/contact?type=idea`.
  - `IdeaList` sections: Accepted / In progress, Under review, and Shipped, plus Not right now
    inside a `<details>`.
  - A note that the forum is hosted on GitHub, under GitHub's terms and privacy policy.
- [ ] **Step 6:** Build `/contact`.
  - The form has `name="contact" method="POST" action="/contact?success=true" data-netlify="true"
    netlify-honeypot="bot-field"` and a hidden `form-name` field.
  - The fields are listed in Interfaces. `type` is a select of the four types, with labels from
    spec 3.5. `project` is a select of the project slugs plus "Not about a specific project".
  - The checkbox label is "OK to post this idea publicly on the forum (without your name or
    email)".
  - There is no reCAPTCHA.
  - Add a plain `mailto:info@kovir.org` line.
  - `contact-form.ts` applies `prefill(location.search, slugs)`, where `slugs` comes from a
    `data-slugs` attribute. On `?success=true` it reveals the thank-you block and hides the form,
    the same pattern as kovir-org's `contactus.astro`.
- [ ] **Step 7:** Run `GITHUB_TOKEN=$(gh auth token) npm run refresh && npm run build`.
  - `dist/ideas/index.html` lists the seeded ideas under "Under review".
  - `dist/contact/index.html` contains `data-netlify="true"` and `name="bot-field"`.
- [ ] **Step 8:** Commit with `feat: ideas board and contact form`, including the refreshed
  snapshot.

### Task 10: About, Privacy, and SEO

**Files:**
- Create: `src/pages/about.astro`, `src/pages/privacy.astro`, `netlify.toml`

- [ ] **Step 1:** Write `/about` covering:
  - The mission: software for mission-driven work at a meta scale, not custom builds for single
    organizations.
  - Governance: "What Kovir Labs officially supports is decided by the kovir.org team."
  - Definitions of `official`, `incubating`, and `lab`, worded the same as the badges.
  - Evan as builder, and the open-source stance.
  - The three contact routes.
- [ ] **Step 2:** Write `/privacy`.
  - It states:
    - no cookies, analytics, or third-party scripts;
    - what the contact form collects (name, email, organization, message);
    - that Netlify processes and stores submissions;
    - that submissions are used only to reply and, if the checkbox is ticked, to post the idea
      without name or email.
  - It says the forum is on GitHub, under GitHub's policies, and links the full Kovir LLC policy
    at `https://www.kovir.org/privacy`.
- [ ] **Step 3:** Write `netlify.toml`.
  - Use `[build] command = "npm run build"` and `publish = "dist"`.
  - Set `[[headers]] for = "/*"` with:
    - the CSP from the Global Constraints
    - `X-Content-Type-Options: nosniff`
    - `Referrer-Policy: strict-origin-when-cross-origin`
    - `Permissions-Policy: camera=(), microphone=(), geolocation=()`
- [ ] **Step 4:** Write `public/robots.txt`, allowing everything and pointing to
  `Sitemap: https://labs.kovir.org/sitemap-index.xml`.
- [ ] **Step 5:** Run `npm run build && npx netlify-cli@27 serve`.
  - Load every page with the browser devtools console open. Expected: zero CSP violations.
  - Confirm `dist/sitemap-index.xml` exists.
- [ ] **Step 6:** Commit with `feat: about, privacy, security headers, sitemap`.

### Task 11: Deploy and launch

**Files:**
- Create: `.github/workflows/deploy.yml`

- [ ] **Step 1:** Write `deploy.yml`, modeled on kovir-org's.
  - Triggers: `push` to `main`, `schedule: - cron: '0 6 * * *'`, and `workflow_dispatch`.
  - `permissions: contents: read`, with a `netlify-production` concurrency group.
  - Steps:
    1. `actions/checkout@v5`
    2. `actions/setup-node@v5` with Node 24
    3. `npm ci`
    4. `npm test`
    5. `npm run check`
    6. `npm run refresh` with `GITHUB_TOKEN: ${{ secrets.GITHUB_TOKEN }}`. A missing repo fails
       the job here.
    7. `npm run catalog`
    8. `npm run build`
    9. `npx --yes netlify-cli@27 deploy --prod --no-build --dir=dist`, with `NETLIFY_AUTH_TOKEN`
       and `NETLIFY_SITE_ID`
  - Add a separate `fallback-build` job that runs `npm ci && GITHUB_TOKEN= npm run refresh && npm run build`.
    This proves the site builds from the committed snapshot alone.
- [ ] **Step 2 (outward):**
  - Create the manual-deploy Netlify site `kovir-labs` with
    `npx netlify-cli@27 sites:create --name kovir-labs`.
  - Add the `NETLIFY_AUTH_TOKEN` and `NETLIFY_SITE_ID` repo secrets.
  - Push. Expected: both jobs pass, and the `.netlify.app` URL serves the site.
- [ ] **Step 3 (outward):**
  - Submit the deploy's contact form once. Expected: the submission appears under Netlify Forms.
  - Set the form notification email to `info@kovir.org` and confirm the test email arrives.
  - Submit again with the honeypot filled in through devtools. Expected: nothing is delivered.
- [ ] **Step 4 (owner):**
  - Add `CNAME labs → kovir-labs.netlify.app` at the kovir.org DNS provider.
  - Add `labs.kovir.org` as the site's custom domain in Netlify. Expected: HTTPS works.
- [ ] **Step 5: Launch checklist (owner decisions).**
  - The kovir.org team sets `support` and `supportedSince` on each project, and `featured` on the
    official ones.
  - Add labs.kovir.org and its Netlify Forms processing to the Kovir LLC iubenda policy.
  - Run Lighthouse on `/` and `/projects/toril`. Expected: Accessibility and Best Practices both
    100.
  - Do a keyboard pass on the nav, filters, and form, and a JavaScript-off pass on /projects and
    /contact.
  - Click every download button against the live release.
- [ ] **Step 6:** Commit with `ci: deploy to Netlify on push and daily`.

### Task 12: Cross-links

**Files:**
- Modify: `~/github/kovir-org/src/components/Footer.astro`. This goes on its own branch and PR in
  kovir-org.
- Create: `kovirlabs/.github` with `profile/README.md`.
- Modify: the READMEs of toril, tenajlo, nu, first-principles-code, and sonome.

- [ ] **Step 1 (outward, needs Marie's OK):** In kovir-org, branch `labs-footer-link` off
  `master`.
  - Add `<li><a href="https://labs.kovir.org">Kovir Labs</a></li>` to the footer's organization
    link list.
  - Run `npm run build`, then open a PR.
- [ ] **Step 2 (outward):** Create the `kovirlabs/.github` repo with `profile/README.md`.
  - Content: the mission in one line, the governance in one line, the projects with links to their
    labs pages, "Suggest an idea" linking to the forum, and the site link.
  - Set the org website with
    `gh api -X PATCH orgs/kovirlabs -f blog=https://labs.kovir.org`.
- [ ] **Step 3 (outward):** In each project repo, add the README footer line
  `Part of [Kovir Labs](https://labs.kovir.org) · [Suggest a feature](https://github.com/kovirlabs/community/discussions/new?category=ideas)`.
  - Commit it on a branch and open a PR per repo.
  - Ask Evan to add a small "A Kovir Labs project" link, pointing to labs.kovir.org, to the
    toril.ink site (`toril/docs/index.html`) and the tenajlo site (`tenajlo/site/index.html`). Open
    those changes in the same per-repo PRs.
  - Separately, list each repo whose `LICENSE` or `NOTICE` names someone other than Kovir LLC.
    Report the list to Evan, and do not edit those files.
- [ ] **Step 4:** Confirm the links. github.com/kovirlabs shows the profile README, and the
  kovir.org footer PR preview shows the link.
