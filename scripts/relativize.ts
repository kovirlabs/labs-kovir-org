// TagCheck's --browser mode opens each page as a file:// URL, so root-relative URLs such as
// /_astro/site.css don't load and pages would be measured without their styles. These rewrite
// a built page's root-relative URLs to relative ones, for the copy that scripts/tagcheck.ts
// checks. The deployed site is not changed.

/** `depth` is how many folders below the site root the page sits (0 for /index.html). */
export function relativizeHtml(html: string, depth: number): string {
  const prefix = depth === 0 ? './' : '../'.repeat(depth);
  const rootUrl = /(^|[\s,])\/(?!\/)/g;
  return html.replace(/\s(href|src|srcset|poster)="([^"]*)"/g, (_, attr: string, value: string) => {
    const rewritten = attr === 'srcset' ? value.replace(rootUrl, `$1${prefix}`) : value.replace(/^\/(?!\/)/, prefix);
    return ` ${attr}="${rewritten}"`;
  });
}

/** Bundled CSS lives in /_astro/, next to the fonts it references. */
export function relativizeCss(css: string): string {
  return css.replace(/url\(\/_astro\//g, 'url(./');
}

/** Root-relative URLs still present (any quoting, srcset entries, CSS url()). tagcheck.ts
 *  refuses to run if a page has any, since TagCheck would then measure it without them. */
export function rootRelativeUrls(text: string): string[] {
  const found: string[] = [];
  const attr = /\b(?:href|src|srcset|poster)=(?:"([^"]*)"|'([^']*)'|([^\s>]+))/g;
  for (const m of text.matchAll(attr)) {
    const value = m[1] ?? m[2] ?? m[3];
    const urls = m[0].startsWith('srcset') ? value.split(',').map((u) => u.trim().split(/\s+/)[0]) : [value];
    if (urls.some((u) => /^\/(?!\/)/.test(u))) found.push(m[0]);
  }
  for (const m of text.matchAll(/url\(\s*(['"]?)\/(?!\/)[^)]*\)/g)) found.push(m[0]);
  return found;
}
