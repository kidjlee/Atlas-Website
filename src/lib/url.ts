const base = import.meta.env.BASE_URL.replace(/\/$/, '');

/** Prefixes an internal path with the site's base path (needed on GitHub Pages). */
export function url(path = ''): string {
  const clean = path.replace(/^\//, '');
  return `${base}/${clean}`;
}

/** Absolute URL for canonical links, Open Graph tags, and structured data. */
export function absoluteUrl(path = '', site?: URL): string {
  const origin = site ? site.origin : '';
  return `${origin}${url(path)}`;
}
