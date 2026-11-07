// npm run tagcheck, part 2: the JavaScript-on browser checks TagCheck can't make. TagCheck
// opens pages as file:// URLs, where module scripts never run, so TagAction and site.ts states
// (revealed filters, validation messages, sort buttons) go unchecked. This serves dist/ over
// HTTP with the production CSP from netlify.toml and checks, in Chromium:
// - no CSP violations or console errors, and the stylesheet actually applied
// - WCAG AA text contrast (4.5:1) in light and dark mode, including interactive states
// - no sideways scrolling at 360px
// - the skip link is visible when focused
// - the top-bar link for the current section is marked aria-current
// Exits 1 on any problem.
import http from 'node:http';
import { existsSync, readFileSync, readdirSync, statSync } from 'node:fs';
import { extname, join, relative, sep } from 'node:path';
import { fileURLToPath } from 'node:url';
import { chromium, type Page } from 'playwright';

const root = fileURLToPath(new URL('..', import.meta.url));
const dist = join(root, 'dist');
const csp = /Content-Security-Policy = "([^"]+)"/.exec(readFileSync(join(root, 'netlify.toml'), 'utf8'))?.[1];
if (!csp) throw new Error('no Content-Security-Policy in netlify.toml');

const TYPES: Record<string, string> = {
  '.html': 'text/html', '.css': 'text/css', '.js': 'text/javascript', '.svg': 'image/svg+xml',
  '.png': 'image/png', '.webp': 'image/webp', '.woff2': 'font/woff2', '.woff': 'font/woff', '.xml': 'application/xml',
};

const server = http.createServer((req, res) => {
  let file = join(dist, decodeURIComponent((req.url ?? '/').split('?')[0]));
  if (existsSync(file) && statSync(file).isDirectory()) file = join(file, 'index.html');
  if (!file.startsWith(dist) || !existsSync(file)) {
    res.writeHead(404);
    res.end();
    return;
  }
  res.writeHead(200, { 'Content-Type': TYPES[extname(file)] ?? 'application/octet-stream', 'Content-Security-Policy': csp });
  res.end(readFileSync(file));
});
await new Promise<void>((r) => server.listen(0, '127.0.0.1', r));
const port = (server.address() as { port: number }).port;
const base = `http://127.0.0.1:${port}`;

function routes(dir: string): string[] {
  return readdirSync(dir, { withFileTypes: true }).flatMap((e) => {
    const p = join(dir, e.name);
    if (e.isDirectory()) return routes(p);
    if (e.name !== 'index.html' && e.name !== '404.html') return [];
    const rel = relative(dist, p).split(sep).join('/');
    return [`/${rel.replace(/index\.html$/, '')}`];
  });
}

// Runs in the page: visible text elements below 4.5:1 against what's behind them.
function lowContrast(): string[] {
  const ctx = document.createElement('canvas').getContext('2d', { willReadFrequently: true })!;
  const rgba = (c: string): number[] => {
    ctx.clearRect(0, 0, 1, 1);
    ctx.fillStyle = c;
    ctx.fillRect(0, 0, 1, 1);
    const [r, g, b, a] = ctx.getImageData(0, 0, 1, 1).data;
    return [r, g, b, a / 255];
  };
  const over = (t: number[], b: number[]) => t.slice(0, 3).map((c, i) => c * t[3] + b[i] * (1 - t[3])).concat(1);
  const lum = ([r, g, b]: number[]) => {
    const l = (c: number) => ((c /= 255) <= 0.03928 ? c / 12.92 : ((c + 0.055) / 1.055) ** 2.4);
    return 0.2126 * l(r) + 0.7152 * l(g) + 0.0722 * l(b);
  };
  const page = rgba(getComputedStyle(document.body).backgroundColor);
  const behind = (el: Element | null): number[] => {
    const layers: number[][] = [];
    for (let n = el; n; n = n.parentElement) {
      const bg = rgba(getComputedStyle(n).backgroundColor);
      if (bg[3] > 0) layers.push(bg);
      if (bg[3] === 1) break;
    }
    return layers.reduceRight((below, layer) => over(layer, below), over(page, [255, 255, 255, 1]));
  };
  return [...document.body.querySelectorAll('*')]
    .filter((el) => [...el.childNodes].some((n) => n.nodeType === 3 && n.textContent!.trim()) && el.checkVisibility() && !el.closest(':disabled'))
    .flatMap((el) => {
      const bg = behind(el);
      const fg = over(rgba(getComputedStyle(el).color), bg);
      const [hi, lo] = [lum(fg), lum(bg)].sort((a, b) => b - a);
      const ratio = (hi + 0.05) / (lo + 0.05);
      return ratio < 4.5 ? [`<${el.localName}> "${el.textContent!.trim().slice(0, 40)}" ${ratio.toFixed(2)}:1`] : [];
    });
}

const problems: string[] = [];
const browser = await chromium.launch();
try {
  for (const path of routes(dist)) {
    for (const scheme of ['light', 'dark'] as const) {
      const page: Page = await browser.newPage({ viewport: { width: 1280, height: 900 }, colorScheme: scheme, reducedMotion: 'reduce' });
      const report = (msg: string) => problems.push(`${path} (${scheme}): ${msg}`);
      page.on('console', (m) => m.type() === 'error' && report(`console error: ${m.text()}`));
      page.on('pageerror', (e) => report(`script error: ${e.message}`));
      await page.goto(base + path, { waitUntil: 'networkidle' });
      await page.waitForTimeout(100);

      const styled = await page.evaluate(() => getComputedStyle(document.body).fontFamily.includes('Inter'));
      if (!styled) report('stylesheet did not apply (body font is not Inter)');

      if (scheme === 'light') {
        await page.keyboard.press('Tab');
        const skip = await page.evaluate(() => {
          const a = document.activeElement as HTMLElement;
          const r = a.getBoundingClientRect();
          return { href: a.getAttribute('href'), w: r.width, h: r.height };
        });
        if (skip.href !== '#main' || skip.w < 20 || skip.h < 10) report(`skip link not visible on focus (${JSON.stringify(skip)})`);

        const section = path.split('/')[1];
        if (['projects', 'ideas', 'about', 'contact'].includes(section)) {
          const current = await page.evaluate(
            (href) => document.querySelector(`body > header nav a[href="${href}"]`)?.getAttribute('aria-current'),
            `/${section}`,
          );
          if (current !== 'page') report(`top-bar link /${section} is not aria-current="page"`);
        }

        await page.setViewportSize({ width: 360, height: 800 });
        const overflow = await page.evaluate(() => document.documentElement.scrollWidth - document.documentElement.clientWidth);
        if (overflow > 0) report(`scrolls sideways by ${overflow}px at 360px`);
        await page.setViewportSize({ width: 1280, height: 900 });
      }

      // Interactive states TagAction and site.ts create, checked like the rest of the page.
      if (path === '/contact/') {
        await page.click('#contact-form button[type="submit"]');
        await page.waitForTimeout(100);
      }
      for (const low of await page.evaluate(lowContrast)) report(`contrast ${low}`);
      await page.close();
    }
  }
} finally {
  await browser.close();
  server.close();
}

for (const p of problems) console.log(p);
console.log(`browser probe: ${problems.length} problem(s)`);
process.exitCode = problems.length ? 1 : 0;
