// Builds the 1200x630 social sharing image (public/og-image.png) from the logo.
// Run after build-logo.mjs: node scripts/build-og.mjs

import { readFileSync, writeFileSync } from 'node:fs';
import { dirname, join } from 'node:path';
import { fileURLToPath } from 'node:url';
import { Resvg } from '@resvg/resvg-js';
import { paths } from './logo-mark.mjs';

const root = join(dirname(fileURLToPath(import.meta.url)), '..');
const logo = readFileSync(join(root, 'public/logo.svg'), 'utf8');
const [, logoWidth] = logo.match(/viewBox="0 0 (\d+) 100"/);
const logoInner = logo.replace(/^<svg[^>]*>/, '').replace(/<\/svg>\s*$/, '');

const W = 1200;
const H = 630;
const logoW = 760;
const logoH = (logoW / Number(logoWidth)) * 100;

const svg = `<svg xmlns="http://www.w3.org/2000/svg" width="${W}" height="${H}" viewBox="0 0 ${W} ${H}">
  <rect width="${W}" height="${H}" fill="#ffffff"/>
  <g transform="translate(820 -260) scale(7.2)" fill="#2BA84A" fill-opacity="0.08">${Object.values(paths).map((d) => `<path d="${d}"/>`).join('')}</g>
  <svg x="${(W - logoW) / 2}" y="190" width="${logoW}" height="${logoH}" viewBox="0 0 ${logoWidth} 100">${logoInner}</svg>
  <text x="${W / 2}" y="${190 + logoH + 92}" text-anchor="middle" font-family="Figtree" font-weight="500" font-size="40" fill="#4a5a50">Registered massage therapy in Abbotsford, BC</text>
  <rect x="0" y="${H - 14}" width="${W}" height="14" fill="#173f2b"/>
</svg>`;

const png = new Resvg(svg, {
  font: {
    fontFiles: [join(root, 'scripts/fonts/figtree-latin-500-normal.ttf')],
    loadSystemFonts: false,
    defaultFontFamily: 'Figtree',
  },
}).render().asPng();

writeFileSync(join(root, 'public/og-image.png'), png);
console.log('Wrote public/og-image.png');
