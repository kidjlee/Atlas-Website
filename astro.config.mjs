// @ts-check
import { defineConfig } from 'astro/config';

import tailwindcss from '@tailwindcss/vite';
import sitemap from '@astrojs/sitemap';

// When the custom domain is connected, set SITE_URL to it (e.g. https://example.com)
// and BASE_PATH to "/", and add public/CNAME. See README.md.
const SITE_URL = process.env.SITE_URL ?? 'https://kidjlee.github.io';
const BASE_PATH = process.env.BASE_PATH ?? '/Atlas-Website';

// https://astro.build/config
export default defineConfig({
  site: SITE_URL,
  base: BASE_PATH,
  trailingSlash: 'ignore',
  vite: {
    plugins: [tailwindcss()],
  },
  integrations: [sitemap()],
});
