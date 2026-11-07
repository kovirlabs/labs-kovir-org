---
name: Tenajlo
repo: kovirlabs/tenajlo
tagline: A desktop Git client for self-hosted Forgejo, for people who'd rather not learn the command line.
audience: Engineering and operations teams that version code, PLC exports, CAD files and documents on their own Forgejo server.
support: lab
status: stable
order: 20
category: desktop-app
platforms: [windows, macos, linux]
website: https://kovirlabs.github.io/tenajlo/
docs: https://kovirlabs.github.io/tenajlo/guide/
icon: ../../assets/projects/tenajlo/icon.png
screenshots:
  - src: ../../assets/projects/tenajlo/changes.png
    alt: Tenajlo's Changes view listing a PLC program and a CAD part, with the highlighted changes and a commit box
  - src: ../../assets/projects/tenajlo/history.png
    alt: Tenajlo's History view with a list of commits and the selected commit's changes
---

Tenajlo is a desktop Git client in the spirit of GitHub Desktop, built for self-hosted
[Forgejo](https://forgejo.org). It is for engineers and technicians who work with code, PLC
exports, CAD files and documentation, and who would rather not learn Git's command line.

You clone repositories from a list, then commit, push, pull and branch with one context-aware
sync button. You sign in once with a Forgejo access token, which is kept in the operating system's
password store. Large files work through Git LFS, which comes bundled on Windows. Merge conflicts
are made approachable, with clear choices to open, resolve or abort.

It works on company networks: it uses the operating system's certificate store for internal CAs,
private DNS, and Windows long paths. Windows 10 and 11 are the main platforms. Linux and macOS work
too.
