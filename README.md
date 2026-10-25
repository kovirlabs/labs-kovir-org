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

Requires Node 22.23.4 or newer. © Kovir LLC.
