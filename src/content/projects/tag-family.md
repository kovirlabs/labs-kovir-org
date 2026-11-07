---
name: Tag family
repo: kovirlabs/tagstack
repos:
  - kovirlabs/tagbrush
  - kovirlabs/tagaction
  - kovirlabs/tagcheck
  - kovirlabs/tagkit
  - kovirlabs/tagkit-jekyll
  - kovirlabs/tagkit-wordpress
tagline: Small tools for plain semantic HTML that looks finished, behaves well, and is checked for mistakes.
audience: Anyone writing web pages by hand or with an AI agent, from documentation sites to small apps.
support: lab
status: beta
order: 60
category: library
platforms: [web]
website: https://kovirlabs.github.io/tagstack/
docs: https://kovirlabs.github.io/tagstack/llms.txt
---

The Tag family makes plain, semantic HTML look good and behave well, with no classes to learn, no
framework, and no build step. Every page still works with JavaScript turned off. Each tool stands
alone, so you can use one of them or all four.

| Tool | What it does | Version |
| --- | --- | --- |
| [TagBrush.css](https://github.com/kovirlabs/tagbrush) | One classless stylesheet: page layout, dark mode, forms, tables, and accessible colors from a single brand color. | 1.2.0 |
| [TagAction](https://github.com/kovirlabs/tagaction) | One small script that makes HTML act finished: sortable tables, copy buttons, dialogs, dropdowns, form messages. | 0.1.0 |
| [TagCheck](https://github.com/kovirlabs/tagcheck) | A command that finds missing labels and alt text, fake buttons, broken references, low contrast, and phone overflow. | 0.1.1 |
| [TagKit](https://github.com/kovirlabs/tagkit) | Copy-paste page templates and snippets, a build-time include tool, and themes for Pandoc, MkDocs, and Hugo. | 0.1.0 |
| [TagKit for Jekyll](https://github.com/kovirlabs/tagkit-jekyll) | A GitHub Pages theme: one line of config gives a finished Markdown site. | Unreleased |
| [TagKit for WordPress](https://github.com/kovirlabs/tagkit-wordpress) | A WordPress block theme built on TagBrush.css. | Unreleased |

The family is designed to be as easy for AI agents as for people. Its
[guide for agents](https://kovirlabs.github.io/tagstack/llms.txt) describes every class and
attribute, so a model writes pages that need no hand-written CSS or JavaScript, then runs TagCheck
to fix what it got wrong.

This site is built on it. labs.kovir.org uses TagBrush.css for its styling and TagAction for its
sortable tables and form messages, and every deploy runs TagCheck.

The Tag family is an experiment from the lab. TagBrush.css is the most mature; the other tools
are early, and their details may still change.
