// Guards the Tag family showcase: styling comes from TagBrush.css and semantic HTML, so the
// only classes allowed are the ones TagBrush documents, components carry no <style> blocks,
// and kovir.css never invents a class.
import { test } from 'node:test';
import assert from 'node:assert/strict';
import { readFileSync, readdirSync } from 'node:fs';
import { join } from 'node:path';

const ROOT = new URL('..', import.meta.url).pathname;
const DOCUMENTED = ['button', 'secondary', 'outline', 'container', 'grid', 'card', 'striped', 'visually-hidden'];

function astroFiles(dir: string): string[] {
  return readdirSync(dir, { withFileTypes: true }).flatMap((e) => {
    const p = join(dir, e.name);
    if (e.isDirectory()) return astroFiles(p);
    return e.name.endsWith('.astro') ? [p] : [];
  });
}

function classTokens(source: string): string[] {
  const tokens: string[] = [];
  for (const m of source.matchAll(/\bclass="([^"]*)"/g)) tokens.push(...m[1].split(/\s+/));
  for (const m of source.matchAll(/class:list=\{\[([^\]]*)\]/g)) {
    for (const s of m[1].matchAll(/'([^']+)'/g)) tokens.push(...s[1].split(/\s+/));
  }
  return tokens.filter(Boolean);
}

test('kovir.css uses no class selectors', () => {
  const css = readFileSync(join(ROOT, 'src/styles/kovir.css'), 'utf8')
    .replace(/\/\*[\s\S]*?\*\//g, '')
    .replace(/url\([^)]*\)/g, '');
  assert.doesNotMatch(css, /(^|[\s,>+~(])\.[a-z_-]/im);
});

test('.astro files use only documented TagBrush classes', () => {
  const bad = astroFiles(join(ROOT, 'src')).flatMap((f) =>
    classTokens(readFileSync(f, 'utf8'))
      .filter((t) => !DOCUMENTED.includes(t))
      .map((t) => `${f.slice(ROOT.length)}: ${t}`),
  );
  assert.deepEqual(bad, []);
});

test('no <style> blocks in .astro files', () => {
  const bad = astroFiles(join(ROOT, 'src')).filter((f) => /<style[\s>]/.test(readFileSync(f, 'utf8')));
  assert.deepEqual(
    bad.map((f) => f.slice(ROOT.length)),
    [],
  );
});
