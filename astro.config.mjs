// @ts-check
import { defineConfig } from 'astro/config';

// The site lives at the root of www.therapie-n25.de (STRATO).
export default defineConfig({
  site: 'https://www.therapie-n25.de',
  base: '/',
  trailingSlash: 'ignore',
  build: { format: 'directory', inlineStylesheets: 'always' },
});
