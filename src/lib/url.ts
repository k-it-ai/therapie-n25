/**
 * Prefix a root-relative path with the site's base path (astro.config `base`).
 * Today the site sits at the domain root ("/impressum/"); should it ever move into a
 * subfolder, changing `base` keeps every internal link working.
 */
export function url(path: string): string {
  const base = import.meta.env.BASE_URL.replace(/\/$/, '');
  return base + (path.startsWith('/') ? path : `/${path}`);
}
