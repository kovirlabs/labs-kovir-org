---
name: Toril
repo: kovirlabs/toril
tagline: A desktop markdown editor that renders as you type and keeps your notes as plain files.
audience: Writers, staff, and teams who keep their notes and documents in plain Markdown.
support: lab
status: stable
order: 10
category: desktop-app
platforms: [windows, macos, linux]
website: https://toril.ink/
icon: ../../assets/projects/toril/icon.png
screenshots:
  - src: ../../assets/projects/toril/editor.png
    alt: Toril editing a Markdown document, with headings, lists and a table rendered in place
---

Toril is a desktop Markdown editor with no separate preview pane. Your Markdown renders in place as
you type, and your files stay ordinary `.md` files in ordinary folders. A Toril workspace can be a
live Obsidian vault, and you can walk away from Toril at any time without converting anything.

It handles CommonMark and GitHub Flavored Markdown, including tables, task lists and footnotes. It
opens and edits HTML documents too, and exports to HTML and RTF. Every save is atomic, so a crash
mid-save cannot corrupt a note you already had.

Windows is the primary platform. macOS and Linux builds come from the same code and get less
testing. Keep backups of anything important, as you would with any editor.
