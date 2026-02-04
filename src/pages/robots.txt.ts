import type { APIRoute } from 'astro';
import { config } from '@/config';

export const prerender = true;

export const GET: APIRoute = () => {
  const body = `User-agent: *\nAllow: /\n\nSitemap: ${config.site.canonicalBase}/sitemap.xml\n`;
  return new Response(body, {
    headers: {
      'Content-Type': 'text/plain; charset=utf-8',
    },
  });
};
