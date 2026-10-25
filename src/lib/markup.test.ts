// Astro's HTML compression drops a line break between text and a following inline element,
// gluing them together ("emailinfo@kovir.org"). Keep text and the link it introduces on one line.
import { test } from 'node:test';
import assert from 'node:assert/strict';
import { readdirSync, readFileSync } from 'node:fs';
import { join } from 'node:path';

const SRC = new URL('..', import.meta.url).pathname;
const astroFiles = (dir: string): string[] =>
  readdirSync(dir, { withFileTypes: true }).flatMap((e) =>
    e.isDirectory() ? astroFiles(join(dir, e.name)) : e.name.endsWith('.astro') ? [join(dir, e.name)] : [],
  );

test('no line ends in text when the next line starts with an inline link', () => {
  const offenders: string[] = [];
  for (const file of astroFiles(SRC)) {
    const lines = readFileSync(file, 'utf8').split('\n');
    lines.forEach((line, i) => {
      const next = lines[i + 1]?.trimStart() ?? '';
      if (/[\w,.'’)]$/.test(line) && !/^\s*[-*/]/.test(line.trimStart()) && next.startsWith('<a ')) {
        offenders.push(`${file.replace(SRC, 'src/')}:${i + 1}`);
      }
    });
  }
  assert.deepEqual(offenders, []);
});
