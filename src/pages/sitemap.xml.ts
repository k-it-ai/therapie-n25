import type { APIRoute } from 'astro';
import { url } from '../lib/url';

// One entry per page; the home page lists its German and English versions.
const pages = [
  { path: '/', alternates: { de: '/', en: '/en/' } },
  { path: '/en/', alternates: { de: '/', en: '/en/' } },
  { path: '/impressum/' },
  { path: '/datenschutz/' },
];

export const GET: APIRoute = ({ site }) => {
  const abs = (p: string) => new URL(url(p), site).href;
  const entries = pages.map(({ path, alternates }) => {
    const links = alternates
      ? Object.entries(alternates)
          .map(([lang, p]) => `<xhtml:link rel="alternate" hreflang="${lang}" href="${abs(p)}"/>`)
          .join('')
      : '';
    return `<url><loc>${abs(path)}</loc>${links}</url>`;
  });
  const xml = `<?xml version="1.0" encoding="UTF-8"?>
<urlset xmlns="http://www.sitemaps.org/schemas/sitemap/0.9" xmlns:xhtml="http://www.w3.org/1999/xhtml">${entries.join('')}</urlset>
`;
  return new Response(xml, { headers: { 'Content-Type': 'application/xml; charset=utf-8' } });
};
