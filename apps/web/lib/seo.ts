import type { Metadata } from 'next';
import { siteSettings } from '@aiyoume/content';
import { getPublicEnv } from './env';

export function absoluteUrl(path = '/') {
  const { siteUrl } = getPublicEnv();
  const base = siteUrl.endsWith('/') ? siteUrl.slice(0, -1) : siteUrl;
  return path === '/' ? `${base}/` : `${base}${path}`;
}

export function buildMetadata({
  title,
  description,
  ogTitle,
  ogDescription,
  path,
}: {
  title: string;
  description: string;
  ogTitle?: string;
  ogDescription?: string;
  path: string;
}): Metadata {
  const canonical = absoluteUrl(path);
  const fullTitle = title === siteSettings.name ? title : `${title} | ${siteSettings.name}`;
  const openGraphTitle = ogTitle ?? fullTitle;
  const openGraphDescription = ogDescription ?? description;

  return {
    title: fullTitle,
    description,
    alternates: {
      canonical,
    },
    openGraph: {
      title: openGraphTitle,
      description: openGraphDescription,
      url: canonical,
      siteName: siteSettings.name,
      images: [absoluteUrl('/og.svg')],
      locale: 'ja_JP',
      type: 'website',
    },
    twitter: {
      card: 'summary_large_image',
      title: openGraphTitle,
      description: openGraphDescription,
      images: [absoluteUrl('/og.svg')],
    },
  };
}
