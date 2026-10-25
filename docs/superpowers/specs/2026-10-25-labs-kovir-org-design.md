# labs.kovir.org — Design

Date: 2026-10-25 · Status: draft v2 for owner review (open questions answered) · Owner: Evan Gress

A separate Astro site for **Kovir Labs**, the development arm of Kovir LLC, at `labs.kovir.org`.
It is a companion to `www.kovir.org` and the public front door for the projects in
<https://github.com/kovirlabs>.

This spec lives in the `kovir-org` repo for now because one part of it (the footer cross-link)
changes this site. Move it into the new repo as that repo's first commit.

---

## 1. Understanding

**Purpose (from the owner)**
- Kovir Labs builds software that supports mission-driven work **at a meta scale**: tools many
  organizations can use, not custom builds for one organization.
- Single organizations are encouraged to tell Labs what they need. A public **feature request
  forum** collects those ideas so the community can add to them and show support.
- **The kovir.org team decides** which ideas and projects Kovir Labs officially takes on and
  supports. Labs builds, Kovir decides direction. The site must make this governance visible.
- Contact routes are `info@kovir.org`, the forum, and a contact form on the website.
- Private and client repos never appear on the site.
- The copyright holder is **Kovir LLC**.
- The logo comes from kovir.org. A vector version does not exist yet. A working SVG may be made for
  this site.

**Remaining assumptions (correct these)**
- A1. Projects that already have their own sites keep them: toril.ink and
  kovirlabs.github.io/tenajlo. Labs summarizes and links out.
- A2. Evan edits site content as Markdown in the repo. No CMS.
- A3. The kovir.org team records its decisions on GitHub by applying labels to forum posts. Evan
  can apply them after a team meeting, so Marie does not need to work in GitHub.

**What success looks like**
- A visitor understands in 10 seconds what Kovir Labs is for, sees the officially supported tools,
  and reaches a download in one click.
- A nonprofit staff member with no GitHub account can still suggest an idea in under two minutes.
- Anyone can see what has been suggested, what Kovir has accepted, and what has shipped.
- Adding a project means adding one Markdown file. Release data updates by itself.
- A GitHub outage never breaks a build or a deploy.
- Marie's site gets one footer link and nothing else changes on it.

---

## 2. Approaches considered

### 2.1 Project catalog

| Option | Summary | Verdict |
|---|---|---|
| **A. Curated Markdown + build-time GitHub enrichment** | One Markdown file per project carries the curated copy. A build step merges in live GitHub data, with a committed snapshot as the fallback. | **Recommended** |
| B. Fully automatic from the GitHub API | Every public repo becomes a card. | Rejected. There is no curation and no way to show the team's support decision. |
| C. Hand-written pages only | Static pages with no API. | Rejected. Versions go stale. |

### 2.2 Feature request forum

| Option | Cost and upkeep | Account needed | Verdict |
|---|---|---|---|
| **A. GitHub Discussions on a `kovirlabs/community` repo, plus a no-account form on the site** | Free, no servers | A GitHub account to post or vote. None to use the form. | **Recommended** |
| B. Self-hosted forum (Discourse, Flarum) | A server, updates, backups, spam moderation | A forum account | Rejected. Too much upkeep for a static setup. |
| C. Hosted feedback board (Canny, Featurebase, hosted Fider) | A monthly fee, third-party cookies, and the iubenda consent work that comes with them | A board account | Rejected for launch. Revisit only if Discussions turns out too technical for nonprofit users. |

With A, upvotes, comments, and categories already exist. Ideas live next to the code they turn
into. The form gives a way in to people who will never make a GitHub account.

---

## 3. Architecture

### 3.1 Repo and stack

- **Repo:** `kovirlabs/labs-kovir-org`, public.
- **Stack:** the same as kovir-org: Astro 7, fully static output, TypeScript `strict`, Node
  `>=22.18.0`, tests on Node's built-in runner (`*.test.ts`), and self-hosted fonts through
  `@fontsource`. No UI framework.
- **Dependencies:** `astro`, `@astrojs/sitemap`, `@fontsource/inter`, `@fontsource/manrope`, and
  `@fontsource/jetbrains-mono`. Dev: `@astrojs/check`, `typescript`. GitHub is called with plain
  `fetch` against REST and GraphQL.
- **Forum repo:** `kovirlabs/community`, public, with Discussions turned on. It holds no code,
  only discussion templates and labels (see 3.6).

### 3.2 Layout

```
labs-kovir-org/
├─ src/
│  ├─ content/projects/          # one .md per project (curated)
│  ├─ content.config.ts          # `projects` collection schema
│  ├─ lib/github.ts              # REST: repos + releases; GraphQL: discussions
│  ├─ lib/merge.ts               # curated entry + GitHub facts → project view model (pure, tested)
│  ├─ lib/ideas.ts               # discussions → idea view models, grouped by status (pure, tested)
│  ├─ data/github-snapshot.json  # last good GitHub data, committed; fallback
│  ├─ layouts/Base.astro
│  ├─ components/                # Header, Footer, ProjectCard, SupportBadge, ReleaseBadge,
│  │                             # PlatformList, IdeaList, ContactForm, KovirBand
│  ├─ pages/
│  │  ├─ index.astro
│  │  ├─ projects/index.astro
│  │  ├─ projects/[slug].astro
│  │  ├─ ideas.astro             # forum front door + idea board
│  │  ├─ contact.astro           # Netlify Form + thank-you state
│  │  ├─ about.astro             # mission + governance
│  │  ├─ privacy.astro
│  │  └─ 404.astro
│  ├─ assets/projects/<slug>/    # icons + screenshots
│  └─ styles/global.css
├─ public/                       # logo SVGs, favicon, robots.txt, og default
├─ scripts/refresh-github.mjs    # pulls GitHub data → github-snapshot.json
├─ scripts/check-catalog.mjs     # lists public repos that have no project file
├─ netlify.toml
├─ .github/workflows/deploy.yml
├─ BRAND.md  CLAUDE.md  README.md
```

### 3.3 Content model: `projects` collection

| Field | Type | Notes |
|---|---|---|
| `name` | string | |
| `repo` | string | `kovirlabs/<name>`. Must be public. |
| `tagline` | string | One line, under about 90 characters, written for humans. |
| `support` | enum | `official`: the kovir.org team has adopted it, and Kovir supports and maintains it. `incubating`: being evaluated, with no support promise yet. `lab`: an experiment or side project, use at your own risk. |
| `status` | enum | `stable` · `beta` · `pre-release` · `archived`. Describes maturity. `support` describes commitment, and the two are independent. |
| `supportedSince` | date? | Required when `support: official`. The date the team adopted it. |
| `featured` | boolean | Shown in the home page hero grid. Only allowed for `official` projects, and the schema enforces it. |
| `order` | number | |
| `category` | enum | `desktop-app` · `library` · `education` · `tooling` |
| `platforms` | string[] | `windows` · `macos` · `linux` · `web` · `python` |
| `audience` | string | A short line on who it helps, such as "Engineering teams on self-hosted Git". It ties each project to the mission. |
| `website`, `docs` | url? | |
| `icon` | image? | |
| `screenshots` | {src, alt}[] | Alt text is required. |
| `forkOf` | string? | For example `mu-editor/mu`. Shown with credit. |
| `ideas` | number[]? | Forum discussion numbers this project came from or tracks. Linked on the project page. |
| `draft` | boolean | Shown in `npm run dev` only. |

The **body** is two to five short paragraphs: who it serves, what problem it solves at scale, and
what makes it different. The URL is `/projects/<slug>`.

**Launch catalog.** The `support` values below are placeholders. **The kovir.org team sets them
before launch.**

| Project | Status | Support (to confirm) |
|---|---|---|
| Toril | stable v1.1.1 | ? |
| Tenajlo | stable v1.2.0 | ? |
| Nu | beta | ? |
| First Principles Code | stable v0.1.0 | ? |
| Sonome | beta | ? |
| simpl-css, json-editor-web, setup-hhtos | not listed | Shown by `check-catalog` as uncataloged |

If no project is `official` at launch, the home page puts "Suggest an idea" and the lab projects
first. The featured grid only appears once a project is adopted.

### 3.4 GitHub data flow

```
scripts/refresh-github.mjs ──► GitHub REST   (repo info, latest release, community files)
                          └──► GitHub GraphQL (kovirlabs/community discussions: title, url,
                                               category, labels, upvoteCount, comments.totalCount,
                                               createdAt, updatedAt)
        ▼
src/data/github-snapshot.json   (committed; `fetchedAt`)
        ▼
astro build ──► lib/merge.ts + lib/ideas.ts ──► pages
```

- **When it runs:** `npm run refresh` by hand, before every CI build, and in a **daily scheduled
  workflow at 06:00 UTC**. The scheduled run rebuilds and deploys but does not commit, so release
  versions and the idea board stay current on their own.
- **Release webhook, later:** a project's release workflow can send `repository_dispatch` to
  rebuild right away.
- **Auth:** the workflow's built-in `GITHUB_TOKEN`, used read-only for public data. No personal
  token is stored.

**Error handling**
- If the API fails, rate-limits, or the token is missing, the script warns and keeps the committed
  snapshot, and the build continues. Projects and ideas fall back independently.
- If GitHub answers that a curated `repo` does not exist, the build **fails**. A renamed, deleted,
  or now-private repo must not stay listed.
- A project with no release shows "No release yet. Build from source."
- The footer shows "Project data updated <date>" from `fetchedAt`.

### 3.5 Pages

**Home `/`**
1. Hero with the mission in one line. Draft: "Open software for mission-driven work. Built once,
   useful to many organizations." Buttons: "Browse projects" and "Suggest an idea".
2. Featured grid of `official` projects: icon, tagline, audience, support badge, version,
   platforms.
3. "From the lab": `incubating` and `lab` projects, in a compact list.
4. "How ideas become software": three steps. **Suggest** (anyone), **Kovir decides** (the
   kovir.org team chooses what to adopt), **Labs builds and supports**. Each step links to /ideas
   or /about.
5. "Top ideas right now": the three most-upvoted open ideas from the forum, with a link to /ideas.
6. Kovir band: "Kovir Labs is the development arm of Kovir LLC" with a link to kovir.org.

**Projects `/projects`:** every project, grouped by support level and filterable by category and
platform. The filter is an inline script, and the full list shows without JavaScript.

**Project page `/projects/<slug>`**
- Header: icon, name, tagline, support badge, version with date, license.
- Primary action, in this order: per-platform download buttons from release assets, then the
  project website, then the GitHub repo.
- Screenshot gallery, the Markdown body, and a facts sidebar.
- "Get involved": request a feature, which links to the forum pre-filtered or to the form with
  this project pre-selected. Also issues, CONTRIBUTING, and SECURITY when those exist.
- Linked forum ideas, from the `ideas` field.
- JSON-LD `SoftwareApplication`.

**Ideas `/ideas`:** the forum's front door.
- A short explanation:
  - Anyone can suggest software that would help mission-driven organizations.
  - Upvotes and comments show demand.
  - The kovir.org team reviews ideas and decides which Labs takes on.
  - Being accepted is a commitment. It is not a delivery date.
- Two ways in:
  - **"Post on the forum"**, which opens a new Ideas discussion in `kovirlabs/community`. This
    needs a GitHub account.
  - **"No GitHub account? Use the form"**, which goes to /contact with the type set to "Idea".
- The idea board, built from the snapshot and grouped by status label: **Accepted / In progress**,
  **Under review**, **Shipped**, and **Not right now**, which is shown collapsed. Each item shows
  its title, upvotes, comment count, and a link to vote or comment on GitHub.

**Contact `/contact`:** Netlify Form.
- Fields: name\*, email\*, organization (optional), type\* (*Suggest an idea*, *Question about a
  project*, *Problem with a project*, *Other*), project (optional select from the catalog),
  message\*, and a checkbox "OK to post this idea publicly on the forum (without your name or
  email)".
- Honeypot field plus Netlify's spam filtering.
- Notifications go to **info@kovir.org**, set in the Netlify UI.
- After submitting, a thank-you state appears using the same no-JavaScript pattern as kovir.org.
- The page also shows `info@kovir.org` as a plain mailto link for people who prefer email.
- **Triage:** if the "OK to post" box is ticked, whoever triages info@kovir.org copies the idea
  into a new forum discussion with the `source: form` label. The idea then joins the same review
  process. This is manual on purpose for launch. Automating it with a Netlify function that posts
  to Discussions needs a stored write token, so it is deferred.

**About `/about`:**
- The mission: software for mission-driven work at a meta scale.
- **Governance:** the kovir.org team decides what Labs officially supports, and what `official`,
  `incubating`, and `lab` mean.
- Who builds it (Evan) and the open-source stance.
- Contact routes.

**Privacy `/privacy`:** see 3.8. **404:** branded, linking to projects and ideas.

There is no blog at launch. The first candidate for after launch is a `/releases` page with an RSS
feed, built from the release data already fetched.

### 3.6 Forum setup (`kovirlabs/community`)

- **Discussion categories:**
  - **Ideas:** an open discussion category with upvotes and a form template asking for the
    problem, who has it, how it is handled today, and how many organizations it affects.
  - **Q&A:** marked answers on.
  - **Announcements:** maintainers only.
  - **Show and tell.**
- **Status labels**, the vocabulary the team uses to record decisions:

  | Label | Meaning |
  |---|---|
  | `status: under-review` | Default for new ideas. |
  | `status: accepted` | The kovir.org team agreed Labs will take this on. |
  | `status: in-progress` | |
  | `status: shipped` | Link the release or project page in the closing comment. |
  | `status: not-now` | Closed with a short, kind reason. |

  Two more labels mark where an idea came from: `source: form` and `source: kovir-client`.
- **Decision cadence:** the team reviews `under-review` ideas on a regular cadence, which the
  owner sets (monthly is a reasonable default). The decision goes on the discussion as a comment
  plus a label.
- A `README.md` and code of conduct in the repo explain the process. The README uses the same
  wording as the /ideas page.
- Org-level Discussions should point at this repo, so `github.com/orgs/kovirlabs/discussions`
  works.

### 3.7 Brand

- **Shared with kovir.org:** palette tokens (teal `#3A787A`, dark teal `#2A5657`, gold `#DFAD05`,
  rust `#8D440F`, coral `#FC7A57`, eggshell `#F1EEE9`, charcoal `#323232`), Manrope headings, and
  Inter body text.
- **Labs register:**
  - The default surface is dark (charcoal and dark teal, eggshell text, gold highlights). A light
    theme follows `prefers-color-scheme`.
  - JetBrains Mono is used for versions and small labels.
  - Support badges use color: `official` in teal with a gold outline, `incubating` in gold,
    `lab` in a neutral outline. Badges carry text as well as color, so color is never the only
    signal.
- **Wordmark:** "Kovir" from the kovir.org logo plus "Labs" set in Manrope.
  - The source is raster only (`public/logo-navbar.png` and `public/logo-wordmark-white.png` in
    kovir-org).
  - For launch, trace the wordmark to an interim SVG with potrace, the method already used for
    kovir.org's `favicon.svg` K.
  - Make dark and light variants plus a "Kovir Labs" lockup, and a favicon using the K on a dark
    teal tile, so it sits beside kovir.org's teal favicon without matching it.
  - Mark these files as interim in `BRAND.md`. Swap them when the official vector exists. The
    traced SVG can also be offered back to kovir.org.
- **Voice:** plain, specific, honest about status and support level, not salesy.
- `BRAND.md` in the new repo records all of this before any component is built.

### 3.8 Privacy and legal

- The site has no analytics, no cookies, and no third-party scripts, so it needs **no consent
  banner**.
- The contact form does collect personal data: name, email, and organization. `/privacy` therefore
  states:
  - what the form collects;
  - that Netlify processes and stores it;
  - that it is used only to reply and, with the checkbox, to post the idea anonymously.
  - It links to kovir.org's full iubenda privacy policy.
- **Owner action:** add labs.kovir.org and its Netlify Forms processing to the Kovir LLC iubenda
  policy.
- The forum lives on GitHub, under GitHub's own terms and privacy policy, and the /ideas page says
  so.
- The footer reads "© <year> Kovir LLC".
- Project licenses are unchanged. A follow-up task should check that each repo's `LICENSE` and
  `NOTICE` name Kovir LLC as the copyright holder. Today the source headers say "Evan Gress".

### 3.9 Hosting, deploy, DNS

- **Netlify:** a new manual-deploy site `kovir-labs`, mirroring kovir-org. The
  `.github/workflows/deploy.yml` workflow runs `npm ci`, `npm test`, refresh, build, and
  `netlify deploy --prod`.
  - Triggers: push to `main`, the daily cron, and `workflow_dispatch`.
  - Secrets: `NETLIFY_AUTH_TOKEN` and `NETLIFY_SITE_ID`.
- **Netlify Forms** is enabled on this site, with notifications to info@kovir.org.
- **DNS:** add `CNAME labs → <site>.netlify.app`. This does not depend on the kovir.org cutover.
- `netlify.toml` sets security headers: a CSP of `default-src 'self'`, with `form-action 'self'`.

### 3.10 Cross-linking

1. **kovir.org footer:** one "Kovir Labs" link in `src/components/Footer.astro`. This needs
   Marie's OK.
2. **GitHub org:**
   - Add a profile README in `kovirlabs/.github` covering the mission, the governance in one line,
     official projects, "Suggest an idea", and the site link.
   - Set the org website field to `https://labs.kovir.org`.
3. **Project READMEs:** add a "Part of Kovir Labs · Suggest a feature" footer linking to the site
   and the forum.
4. **toril.ink and the tenajlo site:** add "A Kovir Labs project".

---

## 4. Testing

- **Unit tests (`node --test`), with no live network calls; fixtures are recorded JSON:**
  - `lib/merge.ts`: snapshot fallback, no release, mapping release assets to platform buttons,
    archived overriding status, and featured only when official.
  - `lib/ideas.ts`: grouping by status label, unlabeled ideas treated as under-review, ordering by
    upvotes then recency, and closed or `not-now` handling.
  - `lib/github.ts`: normalizing REST and GraphQL responses.
- **Schema:** `astro check` plus Zod, including the rules that `official` requires
  `supportedSince` and that `featured` requires `official`.
- **Catalog check:** warns about uncataloged public repos and never fails the build.
- **Build check:** CI runs one build with no token to prove both fallbacks work.
- **Form:** a deploy-preview submission reaches info@kovir.org, and the honeypot blocks a filled
  bot field.
- **Manual before launch:**
  - Lighthouse checks.
  - A keyboard pass on the filters and the form.
  - Check every download button.
  - A no-JavaScript pass on /projects and /contact.

---

## 5. Build sequence

1. Create `kovirlabs/labs-kovir-org`. Scaffold Astro and set up TypeScript strict and the test
   runner. Add `CLAUDE.md` and this spec.
2. Write `BRAND.md`. Trace the interim wordmark SVGs and favicon.
3. Global styles, then the Base layout, Header, and Footer in both themes.
4. Content schema and project files with real copy. The `support` values come from the team.
5. GitHub REST and GraphQL fetch, the snapshot, merge and ideas libraries, with tests.
6. Project page, then the projects list, then the home page.
7. Create `kovirlabs/community`: categories, Ideas template, labels, README. Seed it with two or
   three real ideas. Then build the /ideas page.
8. The /contact form with its thank-you state, then the about, privacy, and 404 pages, then
   sitemap, OG images, and JSON-LD.
9. Netlify site and form notifications, the deploy workflow and cron, and the DNS record.
10. Cross-links: the kovir.org footer (after Marie agrees), the org profile README and website
    field, and the project README footers. Update the iubenda policy.

---

## 6. Decisions log

| # | Question | Decision |
|---|---|---|
| 1 | Audience and "work with us" | Labs builds mission-driven software at a meta scale, not for single organizations. Organizations submit needs through the forum or form. The kovir.org team decides what Labs officially supports. |
| 2 | Contact route | info@kovir.org, the forum (GitHub Discussions), and the website contact form (Netlify Forms). |
| 3 | Private or client work on the site | No. |
| 4 | Copyright | Kovir LLC. |
| 5 | Wordmark | Use the kovir.org logo. An interim SVG traced from it is made for Labs, and the official vector follows from the owner. |

## 7. Still open (non-blocking)

- The `support` level of each launch project. This is a kovir.org team decision, needed before
  step 4 is finished.
- How often the team reviews ideas. The default is monthly.
- Whether to automate posting form ideas to the forum later, which needs a stored write token and
  a Netlify function.
