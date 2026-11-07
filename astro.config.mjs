// @ts-check
import { defineConfig } from 'astro/config';
import sitemap from '@astrojs/sitemap';

export default defineConfig({
  site: 'https://labs.kovir.org',
  integrations: [sitemap({ filter: (page) => !page.includes('/contact/thanks') })],
  // The CSP forbids inline styles and scripts (see netlify.toml), so never inline assets.
  build: { inlineStylesheets: 'never' },
  vite: { build: { assetsInlineLimit: 0 } },
});
