// Geometry for the Atlas leaf-and-ring mark, traced from the storefront sign.
// Everything is in a 100 x 100 box centred on (50, 50). Angles are in degrees,
// measured clockwise from 3 o'clock (SVG's y axis points down).

const r2 = (n) => Math.round(n * 100) / 100;
const smoothstep = (a, b, x) => {
  const t = Math.min(1, Math.max(0, (x - a) / (b - a)));
  return t * t * (3 - 2 * t);
};

/**
 * A tapered stroke that runs around the centre. For t from 0 to 1 it follows
 * angle(t), with its outer edge at outer(t) and a width of width(t).
 */
function stroke({ angle, outer, width, steps = 72 }) {
  const outside = [];
  const inside = [];
  for (let i = 0; i <= steps; i++) {
    const t = i / steps;
    const a = (angle(t) * Math.PI) / 180;
    const ro = outer(t);
    const ri = ro - width(t);
    outside.push([50 + ro * Math.cos(a), 50 + ro * Math.sin(a)]);
    inside.push([50 + ri * Math.cos(a), 50 + ri * Math.sin(a)]);
  }
  const pts = [...outside, ...inside.reverse()];
  return `M${pts.map(([x, y]) => `${r2(x)} ${r2(y)}`).join('L')}Z`;
}

const R = 45;

// Main ring: starts as a thin tail just outside the upper swoosh at 9 o'clock,
// runs round the bottom (its heaviest part) and tapers out just past 1 o'clock.
export const ring = stroke({
  angle: (t) => 186 - t * 232,
  outer: (t) => R + 1.6 * (1 - smoothstep(0, 0.2, t)),
  width: (t) => 10.4 * Math.sin(Math.PI * t) ** 0.78,
});

// Upper swoosh: starts at 12 o'clock on the same circle, sweeps round the top
// left, then its tail eases inward, crossing inside the start of the main ring.
export const swoosh = stroke({
  angle: (t) => 274 - t * 128,
  outer: (t) => R - 8 * Math.max(0, (t - 0.42) / 0.58) ** 1.7,
  width: (t) => 7 * Math.sin(Math.PI * t) ** 0.7,
});

// Leaf, drawn as one piece: a short rounded point on the left and a tip on the right
// whose lower edge hooks upward. A thin crease runs in from the upper left; the strip
// above it joins the body and tapers into the right tip.
export const leaf =
  'M26.5 34.2C33 23.8 47 15.8 65 18.4C60 15 50 13.6 37.6 17.8C44 11.5 54 9.4 63.5 10.6C70 11.4 74.5 15.5 77.2 20.6' +
  'C71.6 22 68.6 25.4 65.6 29.4C58 41 41 46 26.5 34.2Z';

export const paths = { ring, swoosh, leaf };
