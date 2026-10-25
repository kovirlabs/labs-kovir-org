# Launch checklist

Everything below either creates something outside this machine or needs a decision from the
owner or the kovir.org team. The site itself is built and tested on the `site-v1` branch.

## 1. Publish the repos (Evan)

- [x] `kovirlabs/community` is published with Discussions on and the 7 labels created
  (2026-10-25). GitHub's default categories already include Ideas (slug `ideas`), Q&A,
  Announcements and Show and tell. The site's refresh reads the forum.
- [ ] Optional: delete the extra default categories **General** and **Polls** under the
  forum's Settings, then Discussions. There is no API for this.
- [ ] Seed two or three real ideas on the forum.
- [x] `kovirlabs/labs-kovir-org` is published as a public repo (2026-10-25). `site-v1` goes into `main` by pull request.

```sh
# Org profile
cd ~/github/kovirlabs-dot-github
gh repo create kovirlabs/.github --public --source . --push
gh api -X PATCH orgs/kovirlabs -f blog=https://labs.kovir.org
```

In the GitHub UI, point org discussions at `kovirlabs/community` under the org's Settings,
then Discussions.

**Wait for hosting** before publishing the org profile and setting the org website field. Both
link to labs.kovir.org, which won't resolve until DNS and Netlify are done.

## 2. Netlify (Evan) — deferred to a later session

Until the two secrets below exist, every run of the deploy workflow does the following:

- runs the tests and checks;
- refreshes the GitHub data and builds the site;
- **skips** the publish step, leaving a warning on the run instead of failing.

So merging to `main` is safe before Netlify is set up.

```sh
npx netlify-cli@27 sites:create --name kovir-labs     # manual-deploy site, no Git link
gh secret set NETLIFY_AUTH_TOKEN -R kovirlabs/labs-kovir-org
gh secret set NETLIFY_SITE_ID   -R kovirlabs/labs-kovir-org
```

1. Merge `site-v1` into `main`. Both workflow jobs should pass, and `kovir-labs.netlify.app` should
   serve the site.
2. In Netlify, go to Forms, select **Enable form detection**, then trigger a redeploy
   (`gh workflow run deploy.yml -R kovirlabs/labs-kovir-org`). Form detection is off by default
   on new sites, and until it's on, submissions return 404.
3. Submit the contact form once on the live site. It should land on `/contact/thanks/`. Under Netlify, then Forms, then `contact`, set
   the notification email to **info@kovir.org** and confirm the test email arrives.
4. Submit again with the hidden `bot-field` filled in through devtools. Nothing should be
   delivered.
5. Check that the response headers include the CSP from `netlify.toml`:
   `curl -sI https://kovir-labs.netlify.app | grep -i content-security`. Then load the
   site with the browser console open and confirm there are no CSP violations.
6. **The daily refresh can switch itself off.** GitHub disables scheduled workflows in public
   repos after 60 days with no repository activity, and it does this silently. That would freeze
   release versions and the idea board.
   - Check **Actions → Deploy to Netlify** now and then. If GitHub has disabled the schedule,
     select **Enable workflow**.
   - Any push to `main`, such as a project file edit, resets the 60-day clock.

## 3. DNS (owner)

- Add `CNAME labs → kovir-labs.netlify.app` at the kovir.org DNS provider.
- Add `labs.kovir.org` as the custom domain in Netlify, and confirm HTTPS works.

## 4. Decisions (kovir.org team)

- [ ] Set `support` for each project in `src/content/projects/*.md`. Today every project is
  `lab`. For any project made `official`, also add `supportedSince: YYYY-MM-DD`, and optionally
  `featured: true` to show it on the home page.
- [ ] Choose the idea review cadence. The forum README says **monthly**.
- [ ] Add labs.kovir.org and its Netlify Forms processing to the Kovir LLC iubenda privacy policy.
- [ ] Marie: approve the footer link on kovir.org. It is on the local branch `labs-footer-link`
  in `kovir-org`, one line in `src/components/Footer.astro`. Push it and open a PR when she agrees.

## 5. Cross-links in project repos (Evan)

Add this footer line to the README of toril, tenajlo, nu, first-principles-code and sonome:

```md
Part of [Kovir Labs](https://labs.kovir.org) · [Suggest a feature](https://github.com/kovirlabs/community/discussions/new?category=ideas)
```

Add a small "A Kovir Labs project" link pointing to https://labs.kovir.org on the toril.ink site
(`toril/docs/index.html`) and on the tenajlo site (`tenajlo/site/index.html`).

**Copyright check.** The site footer says Kovir LLC. Two repos name a different holder:

- `first-principles-code`: the README header, and probably the source headers, say
  "Copyright 2026 Evan Gress".
- `tenajlo`: `NOTICE` says "Copyright 2026 Kovir Labs".

## 6. Before announcing

- [ ] Run Lighthouse on `/` and `/projects/toril`. Accessibility and Best Practices should both
  score 100.
- [ ] Do a keyboard pass on the nav, the project filters, and the contact form.
- [ ] Click every download button on the live site against the real release.
- [ ] Replace the interim wordmark SVGs when the official vector exists (see `BRAND.md`).
