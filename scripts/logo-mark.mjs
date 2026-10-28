// Geometry for the Atlas leaf-and-ring mark, traced from the storefront sign.
// Everything is in a 100 x 100 box centred on (50, 50). Angles are in degrees,
// measured clockwise from 3 o'clock (SVG's y axis points down).

const r2 = (n) => Math.round(n * 100) / 100;

const point = (cx, cy, radius, deg) => {
  const a = (deg * Math.PI) / 180;
  return [cx + radius * Math.cos(a), cy + radius * Math.sin(a)];
};

/**
 * A crescent that hugs a circle and tapers to points at both ends.
 * The outer edge follows the circle from `from` to `to` (clockwise); the inner
 * edge is a second arc through the same two end points, placed so the crescent
 * is `thickness` wide at its middle.
 */
function crescent({ cx, cy, radius, from, to, thickness }) {
  const span = (((to - from) % 360) + 360) % 360;
  const half = ((360 - span) / 2) * (Math.PI / 180);
  // Inner circle centre sits toward the opening by d, with radius rIn = radius - thickness + d.
  const d = (radius ** 2 - (radius - thickness) ** 2) / (2 * (radius - thickness) + 2 * radius * Math.cos(half));
  const rIn = radius - thickness + d;
  const [ax, ay] = point(cx, cy, radius, from);
  const [bx, by] = point(cx, cy, radius, to);
  const large = span > 180 ? 1 : 0;
  return (
    `M${r2(ax)} ${r2(ay)}A${r2(radius)} ${r2(radius)} 0 ${large} 1 ${r2(bx)} ${r2(by)}` +
    `A${r2(rIn)} ${r2(rIn)} 0 ${large} 0 ${r2(ax)} ${r2(ay)}Z`
  );
}

// Main crescent: from 9 o'clock, around the bottom, up to about 1 o'clock.
export const ring = crescent({ cx: 50, cy: 50, radius: 45, from: -36, to: 180, thickness: 10.4 });

// Upper arc: from 12 o'clock down the left side, finishing just inside the main crescent.
export const swoosh = crescent({ cx: 50.4, cy: 48.6, radius: 44.4, from: 157, to: -88, thickness: 8 });

// Leaf pointing toward the opening, and the thin arc that sits just above it.
export const leaf = 'M24.6 33.6C33.5 21.8 50 15.6 75 19.8C66 40.5 45.5 47.5 24.6 33.6Z';
export const leafArc = 'M35.6 17.4Q56.6 9 75.4 19.2Q56.2 14 35.6 17.4Z';

export const paths = { ring, swoosh, leaf, leafArc };
