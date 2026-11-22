/**
 * Prefix a root-relative path with the site's base path.
 * STRATO build: base "/" → "/impressum/".
 * GitHub Pages preview: base "/therapie-n25" → "/therapie-n25/impressum/".
 */
export function url(path: string): string {
  const base = import.meta.env.BASE_URL.replace(/\/$/, '');
  return base + (path.startsWith('/') ? path : `/${path}`);
}
