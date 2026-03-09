import type { APIRoute } from 'astro';
import { canonicalUrl, config } from '@/config';

export const prerender = true;

export const GET: APIRoute = () => {
  const urls = [
    '/',
    '/learning',
    '/studio',
    '/automation',
    '/articles',
    '/articles/study-tools',
    '/articles/studio-canare-gs6',
    '/privacy',
    '/contact',
    config.apps.voidrush.path,
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
