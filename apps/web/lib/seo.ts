import type { Metadata } from 'next';
import { siteSettings, type GlobalSettings } from '@aiyoume/content';
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
  siteName = siteSettings.name,
}: {
  title: string;
  description: string;
  ogTitle?: string;
  ogDescription?: string;
  path: string;
  siteName?: GlobalSettings['name'];
}): Metadata {
  const canonical = absoluteUrl(path);
  const fullTitle = title === siteName ? title : `${title} | ${siteName}`;
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
      siteName,
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
