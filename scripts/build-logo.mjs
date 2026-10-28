// Rebuilds the Atlas Massage Therapy logo (from the storefront sign) as clean SVG.
// Text is converted to outlines so the logo renders identically everywhere.
// Run with: node scripts/build-logo.mjs

import { mkdirSync, readFileSync, writeFileSync } from 'node:fs';
import { dirname, join } from 'node:path';
import { fileURLToPath } from 'node:url';
import opentype from 'opentype.js';
import { Resvg } from '@resvg/resvg-js';
import { paths } from './logo-mark.mjs';

const root = join(dirname(fileURLToPath(import.meta.url)), '..');
const fontDir = join(root, 'scripts/fonts');
const GREEN = '#2BA84A';

const loadFont = (file) => {
  const buf = readFileSync(join(fontDir, file));
  return opentype.parse(buf.buffer.slice(buf.byteOffset, buf.byteOffset + buf.byteLength));
};
const cinzel = loadFont('cinzel-latin-700-normal.ttf');
const montserrat = loadFont('montserrat-latin-700-normal.ttf');

// ---------- Mark (viewBox 0 0 100 100, traced from the sign in logo-mark.mjs) ----------

const markShapes = (fill) => `<g fill="${fill}">${Object.values(paths).map((d) => `<path d="${d}"/>`).join('')}</g>`;

// ---------- Text helpers ----------

function textPath(font, text, size, tracking, x, baseline) {
  const glyphs = font.stringToGlyphs(text);
  const scale = size / font.unitsPerEm;
  let cursor = x;
  const parts = [];
  glyphs.forEach((g, i) => {
    parts.push(g.getPath(cursor, baseline, size).toPathData(2));
    cursor += g.advanceWidth * scale;
    if (i < glyphs.length - 1) {
      cursor += font.getKerningValue(g, glyphs[i + 1]) * scale + tracking;
    }
  });
  return { d: parts.join(''), width: cursor - x };
}

function measure(font, text, size, tracking) {
  return textPath(font, text, size, tracking, 0, 0).width;
}

const capHeight = (font, size) => (font.tables.os2.sCapHeight / font.unitsPerEm) * size;

// ---------- Horizontal lockup ----------

function lockup({ atlasFill, subFill, markFill }) {
  const markSize = 100;
  const atlasSize = 86;
  const atlasCap = capHeight(cinzel, atlasSize);
  const atlasTracking = atlasSize * 0.06;
  const atlasX = markSize + 20;
  const atlasBaseline = 50 + atlasCap / 2;
  const atlas = textPath(cinzel, 'ATLAS', atlasSize, atlasTracking, atlasX, atlasBaseline);

  // Two stacked lines whose combined height matches the ATLAS cap height.
  const gapBetween = atlasCap * 0.34;
  const subCap = (atlasCap - gapBetween) / 2;
  const subSize = subCap / (montserrat.tables.os2.sCapHeight / montserrat.unitsPerEm);
  const subX = atlasX + atlas.width + 24;
  const top = 50 - atlasCap / 2;

  // Justify both lines to the same width, like the sign.
  const baseTracking = subSize * 0.2;
  const wMassage = measure(montserrat, 'MASSAGE', subSize, baseTracking);
  const wTherapy = measure(montserrat, 'THERAPY', subSize, baseTracking);
  const target = Math.max(wMassage, wTherapy);
  const tMassage = baseTracking + (target - wMassage) / 6;
  const tTherapy = baseTracking + (target - wTherapy) / 6;

  const massage = textPath(montserrat, 'MASSAGE', subSize, tMassage, subX, top + subCap);
  const therapy = textPath(montserrat, 'THERAPY', subSize, tTherapy, subX, top + atlasCap);

  const width = Math.ceil(subX + target + 2);
  const svg = `<svg xmlns="http://www.w3.org/2000/svg" viewBox="0 0 ${width} 100" role="img" aria-label="Atlas Massage Therapy">${markShapes(markFill)}<path fill="${atlasFill}" d="${atlas.d}"/><path fill="${subFill}" d="${massage.d}${therapy.d}"/></svg>\n`;
  return { svg, width };
}

// ---------- Write files ----------

const outDir = join(root, 'src/assets/logo');
mkdirSync(outDir, { recursive: true });

const inline = lockup({ atlasFill: 'currentColor', subFill: 'var(--logo-accent, ' + GREEN + ')', markFill: 'var(--logo-accent, ' + GREEN + ')' });
writeFileSync(join(outDir, 'logo.svg'), inline.svg);

const dark = lockup({ atlasFill: '#16241B', subFill: GREEN, markFill: GREEN });
writeFileSync(join(root, 'public/logo.svg'), dark.svg);
const light = lockup({ atlasFill: '#FFFFFF', subFill: GREEN, markFill: GREEN });
writeFileSync(join(root, 'public/logo-light.svg'), light.svg);

const mark = `<svg xmlns="http://www.w3.org/2000/svg" viewBox="0 0 100 100">${markShapes(GREEN)}</svg>\n`;
writeFileSync(join(outDir, 'mark.svg'), mark.replace(`fill="${GREEN}"`, 'fill="currentColor"'));

const favicon = `<svg xmlns="http://www.w3.org/2000/svg" viewBox="-4 -4 108 108">${markShapes(GREEN)}</svg>\n`;
writeFileSync(join(root, 'public/favicon.svg'), favicon);

// Shared with HeroRing and other components so every copy of the mark is identical.
writeFileSync(join(outDir, 'mark-paths.json'), JSON.stringify(paths, null, 2) + '\n');

// ---------- PNG and ICO icons ----------

const iconPng = (size, padding) => {
  const svg = `<svg xmlns="http://www.w3.org/2000/svg" width="${size}" height="${size}" viewBox="${-padding} ${-padding} ${100 + padding * 2} ${100 + padding * 2}"><rect x="${-padding}" y="${-padding}" width="100%" height="100%" fill="#fff"/>${markShapes(GREEN)}</svg>`;
  return new Resvg(svg).render().asPng();
};

writeFileSync(join(root, 'public/apple-touch-icon.png'), iconPng(180, 18));
writeFileSync(join(root, 'public/icon-512.png'), iconPng(512, 18));

// favicon.ico holds PNG images at 16, 32 and 48px.
const icoSizes = [16, 32, 48];
const images = icoSizes.map((s) => iconPng(s, 4));
const header = Buffer.alloc(6 + 16 * images.length);
header.writeUInt16LE(0, 0);
header.writeUInt16LE(1, 2);
header.writeUInt16LE(images.length, 4);
let offset = header.length;
images.forEach((img, i) => {
  const e = 6 + i * 16;
  header.writeUInt8(icoSizes[i], e);
  header.writeUInt8(icoSizes[i], e + 1);
  header.writeUInt16LE(1, e + 4);
  header.writeUInt16LE(32, e + 6);
  header.writeUInt32LE(img.length, e + 8);
  header.writeUInt32LE(offset, e + 12);
  offset += img.length;
});
writeFileSync(join(root, 'public/favicon.ico'), Buffer.concat([header, ...images]));

console.log(`Logo written (lockup ${inline.width}x100).`);
