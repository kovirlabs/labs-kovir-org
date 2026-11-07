// npm run tagcheck: run TagCheck over the built site with --strict --browser (any finding
// fails). TagCheck opens pages as file:// URLs, so it checks a temporary copy of dist/ whose
// root-relative URLs are made relative (see relativize.ts); otherwise the browser checks would
// measure pages without their stylesheet. Extra arguments (e.g. --json) pass through.
// TagCheck can't run page scripts from file://; scripts/browser-probe.ts covers that.
import { cpSync, mkdtempSync, readFileSync, readdirSync, rmSync, writeFileSync } from 'node:fs';
import { tmpdir } from 'node:os';
import { join, relative, sep } from 'node:path';
import { spawnSync } from 'node:child_process';
import { relativizeCss, relativizeHtml, rootRelativeUrls } from './relativize.ts';

const root = new URL('..', import.meta.url).pathname;
const dist = join(root, 'dist');
const copy = mkdtempSync(join(tmpdir(), 'labs-tagcheck-'));

function walk(dir: string): string[] {
  return readdirSync(dir, { withFileTypes: true }).flatMap((e) =>
    e.isDirectory() ? walk(join(dir, e.name)) : [join(dir, e.name)],
  );
}

try {
  cpSync(dist, copy, { recursive: true });
  for (const file of walk(copy)) {
    if (file.endsWith('.html')) {
      const depth = relative(copy, file).split(sep).length - 1;
      writeFileSync(file, relativizeHtml(readFileSync(file, 'utf8'), depth));
    } else if (file.endsWith('.css')) {
      writeFileSync(file, relativizeCss(readFileSync(file, 'utf8')));
    }
  }
  // If any root-relative URL survived, TagCheck would measure that page without it.
  const left = walk(copy)
    .filter((f) => f.endsWith('.html') || f.endsWith('.css'))
    .flatMap((f) => rootRelativeUrls(readFileSync(f, 'utf8')).map((u) => `${relative(copy, f)}: ${u}`));
  if (left.length) throw new Error(`root-relative URLs left after relativizing:\n${left.join('\n')}`);

  const bin = join(root, 'node_modules/.bin/tagcheck');
  const run = spawnSync(bin, [copy, '--strict', '--browser', ...process.argv.slice(2)], { encoding: 'utf8' });
  // Report paths as dist/… rather than the temporary folder.
  process.stdout.write((run.stdout ?? '').split(copy).join('dist'));
  process.stderr.write(run.stderr ?? '');
  process.exitCode = run.status ?? 2;
} finally {
  rmSync(copy, { recursive: true, force: true });
}
