// @ts-check
import { defineConfig } from 'astro/config';

export default defineConfig({
  site: 'https://www.therapie-n25.de',
  trailingSlash: 'ignore',
  build: { format: 'directory' },
});
