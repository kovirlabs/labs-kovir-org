import { test } from 'node:test';
import assert from 'node:assert/strict';
import { relativizeCss, relativizeHtml } from './relativize.ts';

test('relativizeHtml: root-relative src and href point up to the site root', () => {
  const html = '<link rel="stylesheet" href="/_astro/a.css"><img src="/logo.svg" alt="">';
  assert.equal(
    relativizeHtml(html, 2),
    '<link rel="stylesheet" href="../../_astro/a.css"><img src="../../logo.svg" alt="">',
  );
});

test('relativizeHtml: a top-level page uses ./', () => {
  assert.equal(relativizeHtml('<script type="module" src="/_astro/b.js"></script>', 0), '<script type="module" src="./_astro/b.js"></script>');
});

test('relativizeHtml: every URL in a srcset is rewritten', () => {
  assert.equal(
    relativizeHtml('<img srcset="/_astro/a.png 640w, /_astro/b.png 1100w" alt="">', 1),
    '<img srcset="../_astro/a.png 640w, ../_astro/b.png 1100w" alt="">',
  );
});

test('relativizeHtml: absolute, protocol-relative, fragment and mailto URLs are left alone', () => {
  const html = '<a href="https://x.org/">x</a><a href="//cdn.x/a.js">y</a><a href="#main">z</a><a href="mailto:a@b.c">m</a>';
  assert.equal(relativizeHtml(html, 3), html);
});

test('relativizeCss: font URLs in a bundled stylesheet point to its own folder', () => {
  assert.equal(
    relativizeCss('@font-face{src:url(/_astro/inter.woff2) format("woff2"),url(/_astro/inter.woff)}'),
    '@font-face{src:url(./inter.woff2) format("woff2"),url(./inter.woff)}',
  );
});
