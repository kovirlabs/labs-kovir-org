# Kovir Labs — Brand Guide

Kovir Labs is the development arm of Kovir LLC. Its site is a **sibling** of www.kovir.org. It
shares the family palette and type, in a more technical register. The source of truth for the
family palette is `BRAND.md` in `kovirlabs/kovir-org`.

## Palette (shared with kovir.org)

| Token | Hex | Name |
|---|---|---|
| `--teal` | `#3A787A` | Teal: actions, primary buttons |
| `--teal-dark` | `#2A5657` | Dark teal: bands, favicon tile |
| `--gold` | `#DFAD05` | Gold: highlights on dark surfaces |
| `--rust` | `#8D440F` | Rust: highlights on light surfaces (gold fails contrast on cream) |
| `--coral` | `#FC7A57` | Coral: rare warm accent |
| `--eggshell` | `#F1EEE9` | Eggshell: light background and dark-theme text |
| `--charcoal` | `#323232` | Charcoal: light-theme text and the dark-theme base |

## Theme

The site is **always dark**, whatever the reader's OS setting (`color-scheme: dark`). kovir.org is
cream by default, and the dark site is what makes Labs read as "the workshop" next to it. The dark
palette is kovir.org's own warm dark mode (`tagstack/kovir-theme.css` in `kovirlabs/kovir-org`),
so the two sites look like one family. Labs keeps **gold links and highlights** as its accent where
kovir.org uses teal links. Keep the family warm: no cool greys.

| Role | Value |
|---|---|
| `--color-background` | `#1B1916` (warm charcoal) |
| `--color-surface` (cards) | `#282420` |
| `--color-border` | `#3D3732` |
| `--color-text` / `--color-heading` | `#EEE9E2` / `#F7F3EE` |
| `--color-text-muted` | `#C6BEB3` |
| `--color-link` / `--color-highlight` | `#DFAD05` (gold) |
| `--color-primary` / `--color-on-primary` | `#3A787A` / `#FFFFFF` (teal buttons) |
| Bands | `#264F50` deep teal, white text, `#F2C744` gold links, gold buttons with charcoal text |

Type scale, card radius (18px), shadows and button and input sizing also match kovir.org's theme.
Every text pair is at least 4.5:1. The lowest is band gold on a band card, at 4.74:1.

## Type

- **Manrope** (500/700/800) for headings, self-hosted with `@fontsource`.
- **Inter** (400/700) for body text.
- **JetBrains Mono** (400) for version numbers, commands and small labels.

No runtime font requests.

## Support badges

The badge always shows its text, so color is never the only signal.

| Support | Badge text | Style |
|---|---|---|
| `official` | Officially supported | Teal fill, gold outline |
| `incubating` | Incubating | Gold outline, gold text |
| `lab` | From the lab | Neutral outline, muted text |

## Logo (interim)

- `public/logo-labs-dark.svg`: eggshell "Kovir" with gold "Labs", for dark surfaces.
- `public/logo-labs-light.svg`: charcoal "Kovir" with teal "Labs", for light surfaces. The site
  no longer uses it; keep it for print and other light backgrounds.
- `public/favicon.svg`: kovir.org's traced K, in eggshell on a dark-teal tile, with a gold bar.
  It sits beside kovir.org's teal favicon without matching it.
- `docs/kovir-wordmark-traced.svg`: the bare traced "Kovir™" wordmark. kovir.org can reuse it
  until an official vector exists.

> **Interim.** "Kovir" is traced with potrace from kovir.org's raster `logo-navbar.png` (500×200),
> and "Labs" is Manrope 500 converted to outlines. Replace these files when the owner provides
> the official vector wordmark.

## Voice

Plain, specific and honest. Say what a tool does, who it is for, and how mature it is ("Windows is
the primary platform; macOS gets less testing"). Never inflate status or support. "Accepted" means
the kovir.org team has committed to an idea, not that it has a date. No marketing superlatives.
