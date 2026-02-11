import type { APIRoute } from 'astro';
import { canonicalUrl } from '@/config';

export const prerender = true;

export const GET: APIRoute = () => {
  const urls = [
    '/',
    '/education',
    '/creator',
    '/automation',
    '/articles',
    '/articles/study-tools',
    '/privacy',
    '/contact',
  ];

  const body = `<?xml version="1.0" encoding="UTF-8"?>\n<urlset xmlns="http://www.sitemaps.org/schemas/sitemap/0.9">\n${urls
    .map((p) => `  <url><loc>${canonicalUrl(p)}</loc></url>`)
    .join('\n')}\n</urlset>\n`;

  return new Response(body, {
    headers: {
      'Content-Type': 'application/xml; charset=utf-8',
    },
  });
};
