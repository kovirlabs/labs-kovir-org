# labs.kovir.org

The website for **Kovir Labs**, the development arm of [Kovir LLC](https://www.kovir.org).
Kovir Labs builds open software that supports mission-driven work at a meta scale: tools that
many organizations can use. The site catalogs the projects in
[github.com/kovirlabs](https://github.com/kovirlabs) and collects ideas from the community. The
kovir.org team decides which ideas Kovir Labs takes on.

Built with [Astro](https://astro.build) as a fully static site, deployed on Netlify.

```sh
npm install
npm run dev                                   # localhost:4321
npm test                                      # unit tests
GITHUB_TOKEN=$(gh auth token) npm run refresh # update project + idea data
npm run build                                 # → dist/
```

## Maintaining the project catalog

Every project page is one Markdown file in `src/content/projects/`. The filename is the URL
(`tds-openapi.md` → `/projects/tds-openapi`). The schema is in `src/content.config.ts`, and the
build fails with a clear message if a file breaks a rule.

**Support level.** The kovir.org team decides it, and one frontmatter field sets it:

| You want | Frontmatter | Where it shows |
|---|---|---|
| A supported initiative | `support: official`, `supportedSince: YYYY-MM-DD`, `featured: true` | "Officially supported" on the home page and Projects page |
| Supported, but not on the home page | `support: official`, `supportedSince: YYYY-MM-DD` | The Projects page only |
| Being evaluated | `support: incubating` | "Incubating" on the Projects page |
| An experiment | `support: lab` | "From the lab" |

`featured` requires `official`, and `official` requires `supportedSince`. When a project changes
level, also check its page text for wording like "an experiment" or "supported."

**Add a project.** Copy an existing file, set `repo: kovirlabs/<name>`, and write the body in the
plain voice of `BRAND.md`. The tagline is at most 110 characters. Use `repos:` when one page
covers several repositories (see `tag-family.md`). `order` sorts the cards, with lower numbers
first. Never list a private repository.

**Check before you push.**

```sh
GITHUB_TOKEN=$(gh auth token) npm run refresh  # pull release data for the new repo
npm run catalog                                # lists public repos that have no project page
npm run check && npm test && npm run build && npm run tagcheck
```

Public repos with no project page still appear in the "All repositories" table on /projects, so
`npm run catalog` warns but doesn't fail.

**Releases update themselves.** Deploys refresh the GitHub data on every push to `main` and daily
at 06:00 UTC. Publishing a GitHub release on the project's repo is enough. Nothing here needs to
change. GitHub pauses the daily schedule after 60 days without repo activity, so if release data
looks stale, re-enable it under Actions.

Requires Node 22.23.4 or newer. © Kovir LLC.
