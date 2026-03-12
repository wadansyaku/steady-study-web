import type { MetadataRoute } from 'next';
import { getCaseStudies } from '@aiyoume/content';
import { absoluteUrl } from '@/lib/seo';

const baseRoutes = [
  '/',
  '/about',
  '/profile',
  '/process',
  '/pricing',
  '/faq',
  '/security',
  '/terms',
  '/contact',
  '/privacy',
  '/learning',
  '/studio',
  '/automation',
  '/case-studies',
];

export default async function sitemap(): Promise<MetadataRoute.Sitemap> {
  const now = new Date();
  const studies = await getCaseStudies();

  return [
    ...baseRoutes.map((route) => ({
      url: absoluteUrl(route),
      lastModified: now,
      changeFrequency: route === '/' ? ('weekly' as const) : ('monthly' as const),
      priority: route === '/' ? 1 : 0.7,
    })),
    ...studies.map((item) => ({
      url: absoluteUrl(`/case-studies/${item.slug}`),
      lastModified: now,
      changeFrequency: 'monthly' as const,
      priority: 0.65,
    })),
  ];
}
