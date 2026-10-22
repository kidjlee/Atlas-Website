// Rebuilds the Atlas Massage Therapy logo (from the storefront sign) as clean SVG.
// Text is converted to outlines so the logo renders identically everywhere.
// Run with: node scripts/build-logo.mjs

import { mkdirSync, readFileSync, writeFileSync } from 'node:fs';
import { dirname, join } from 'node:path';
import { fileURLToPath } from 'node:url';
import opentype from 'opentype.js';

const root = join(dirname(fileURLToPath(import.meta.url)), '..');
const fontDir = join(root, 'scripts/fonts');
const GREEN = '#2BA84A';

const loadFont = (file) => {
  const buf = readFileSync(join(fontDir, file));
  return opentype.parse(buf.buffer.slice(buf.byteOffset, buf.byteOffset + buf.byteLength));
};
const cinzel = loadFont('cinzel-latin-700-normal.ttf');
const montserrat = loadFont('montserrat-latin-700-normal.ttf');

const r = (n) => Math.round(n * 100) / 100;

// ---------- Mark (viewBox 0 0 100 100) ----------

const C = 50;
const polar = (radius, deg) => {
  const a = (deg * Math.PI) / 180;
  return [r(C + radius * Math.cos(a)), r(C + radius * Math.sin(a))];
};

// Main swoosh: a crescent open at the top right, tapering at both ends and
// heaviest at the bottom left, like the sign.
const ringStart = polar(45, -28);
const ringEnd = polar(45, -82);
const ring = `M${ringStart} A45 45 0 1 1 ${ringEnd} A39.8 39.8 0 1 0 ${ringStart}Z`;

// Inner blade hugging the lower left of the ring.
const bladeStart = polar(31, 105);
const bladeEnd = polar(31, 196);
const blade = `M${bladeStart} A31 31 0 0 1 ${bladeEnd} A50 50 0 0 0 ${bladeStart}Z`;

// Leaf pointing toward the opening, with the midrib cut out.
const leaf = 'M28.5 46 C35.5 29.5 52.5 21 71 25.5 C63 42.5 46 50.5 28.5 46Z';
const midrib = 'M31.5 44.6 Q48 39.5 64.5 29.2';

const markDefs = (id) =>
  `<mask id="${id}" maskUnits="userSpaceOnUse" x="0" y="0" width="100" height="100"><rect width="100" height="100" fill="#fff"/><path d="${midrib}" fill="none" stroke="#000" stroke-width="2.1" stroke-linecap="round"/></mask>`;

const markShapes = (id, fill) =>
  `<g fill="${fill}"><path d="${ring}"/><path d="${blade}"/><path d="${leaf}" mask="url(#${id})"/></g>`;

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

function lockup({ atlasFill, subFill, markFill, id }) {
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
  const svg = `<svg xmlns="http://www.w3.org/2000/svg" viewBox="0 0 ${width} 100" role="img" aria-label="Atlas Massage Therapy"><defs>${markDefs(id)}</defs>${markShapes(id, markFill)}<path fill="${atlasFill}" d="${atlas.d}"/><path fill="${subFill}" d="${massage.d}${therapy.d}"/></svg>\n`;
  return { svg, width };
}

// ---------- Write files ----------

const outDir = join(root, 'src/assets/logo');
mkdirSync(outDir, { recursive: true });

const inline = lockup({ atlasFill: 'currentColor', subFill: 'var(--logo-accent, ' + GREEN + ')', markFill: 'var(--logo-accent, ' + GREEN + ')', id: 'atlas-leaf-cut' });
writeFileSync(join(outDir, 'logo.svg'), inline.svg);

const dark = lockup({ atlasFill: '#16241B', subFill: GREEN, markFill: GREEN, id: 'm' });
writeFileSync(join(root, 'public/logo.svg'), dark.svg);
const light = lockup({ atlasFill: '#FFFFFF', subFill: GREEN, markFill: GREEN, id: 'm' });
writeFileSync(join(root, 'public/logo-light.svg'), light.svg);

const mark = `<svg xmlns="http://www.w3.org/2000/svg" viewBox="0 0 100 100"><defs>${markDefs('m')}</defs>${markShapes('m', GREEN)}</svg>\n`;
writeFileSync(join(outDir, 'mark.svg'), mark.replace(`fill="${GREEN}"`, 'fill="currentColor"'));

const favicon = `<svg xmlns="http://www.w3.org/2000/svg" viewBox="-4 -4 108 108"><defs>${markDefs('m')}</defs>${markShapes('m', GREEN)}</svg>\n`;
writeFileSync(join(root, 'public/favicon.svg'), favicon);

console.log(`Logo written (lockup ${inline.width}x100).`);
