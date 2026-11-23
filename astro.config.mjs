// @ts-check
import { defineConfig } from 'astro/config';

// Defaults build for www.therapie-n25.de (STRATO, site at the domain root).
// The GitHub Pages preview sets SITE_URL / BASE_PATH (see .github/workflows/deploy.yml).
export default defineConfig({
  site: process.env.SITE_URL || 'https://www.therapie-n25.de',
  base: process.env.BASE_PATH || '/',
  trailingSlash: 'ignore',
  build: { format: 'directory', inlineStylesheets: 'always' },
});
