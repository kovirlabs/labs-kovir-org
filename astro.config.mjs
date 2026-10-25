// @ts-check
import { defineConfig } from 'astro/config';
import sitemap from '@astrojs/sitemap';

export default defineConfig({
  site: 'https://labs.kovir.org',
  integrations: [sitemap()],
  // The CSP forbids inline styles and scripts (see netlify.toml), so never inline assets.
  build: { inlineStylesheets: 'never' },
  vite: { build: { assetsInlineLimit: 0 } },
});
