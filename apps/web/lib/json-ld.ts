import type { FAQItem, GlobalSettings } from '@aiyoume/content';
import { absoluteUrl } from './seo';

export function organizationJsonLd(settings: GlobalSettings) {
  return {
    '@context': 'https://schema.org',
    '@type': 'Organization',
    name: settings.name,
    url: absoluteUrl('/'),
    logo: absoluteUrl('/brand/aiyoume-logo-dark.svg'),
    email: `mailto:${settings.contactChannels.email}`,
    sameAs: [settings.contactChannels.line],
  };
}

export function websiteJsonLd(settings: GlobalSettings) {
  return {
    '@context': 'https://schema.org',
    '@type': 'WebSite',
    name: settings.name,
    url: absoluteUrl('/'),
    description: settings.description,
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
