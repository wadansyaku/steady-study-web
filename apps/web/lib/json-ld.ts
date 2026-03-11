import type { FAQItem } from '@aiyoume/content';
import { siteSettings } from '@aiyoume/content';
import { absoluteUrl } from './seo';

export function organizationJsonLd() {
  return {
    '@context': 'https://schema.org',
    '@type': 'Organization',
    name: siteSettings.name,
    url: absoluteUrl('/'),
    logo: absoluteUrl('/brand/aiyoume-logo-dark.svg'),
    email: `mailto:${siteSettings.contactChannels.email}`,
    sameAs: [siteSettings.contactChannels.line],
  };
}

export function websiteJsonLd() {
  return {
    '@context': 'https://schema.org',
    '@type': 'WebSite',
    name: siteSettings.name,
    url: absoluteUrl('/'),
    description: siteSettings.description,
  };
}

export function faqJsonLd(items: FAQItem[]) {
  return {
    '@context': 'https://schema.org',
    '@type': 'FAQPage',
    mainEntity: items.map((item) => ({
      '@type': 'Question',
      name: item.question,
      acceptedAnswer: {
        '@type': 'Answer',
        text: item.answer,
      },
    })),
  };
}

export function breadcrumbJsonLd(items: Array<{ name: string; path: string }>) {
  return {
    '@context': 'https://schema.org',
    '@type': 'BreadcrumbList',
    itemListElement: items.map((item, index) => ({
      '@type': 'ListItem',
      position: index + 1,
      name: item.name,
      item: absoluteUrl(item.path),
    })),
  };
}
