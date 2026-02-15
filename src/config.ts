const domain = 'ai-yu-me.com';
const contactEmail = 'TODO_CONTACT_EMAIL';

export const config = {
  site: {
    name: 'AIYuMe',
    domain,
    canonicalBase: `https://${domain}`,
    defaultOgImagePath: '/og.svg',
  },
  brands: {
    home: 'AIYuMe',
    education: 'AIYuMe Learning',
    english: 'AIYuMe Learning English',
    creator: 'AIYuMe Studio',
    automation: 'AIYuMe Automation',
  },
  urls: {
    lineAddFriend: 'TODO_LINE_URL',
    booking: 'TODO_BOOKING_URL',
    englishApp: `https://${domain}/aiyume_english/auth`,
    consultations: {
      learningLine: 'TODO_LINE_URL',
      studioLine: 'TODO_LINE_URL',
      automationMail: `mailto:${contactEmail}`,
      automationLine: 'TODO_LINE_URL',
    },
  },
  contact: {
    email: contactEmail,
  },
  affiliate: {
    amazonAssociateTag: 'TODO_AMAZON_ASSOCIATE_TAG',
    disclosure:
      '当サイトはアフィリエイト広告を利用しています。Amazonのアソシエイトとして、AIYuMe は適格販売により収入を得ています。',
    amazonLinks: {
      studyTimer: 'https://amzn.to/4rHUUZq',
      reviewBinder: 'https://amzn.to/3ZyFT06',
      deskLight: 'https://amzn.to/4auRN01',
      canareGs6Cable: 'https://amzn.to/4tA6Xd0',
    },
  },
  education: {
    bookingNote: '週5枠限定（初回無料面談30分）',
    pricePlaceholder: 'TODO_PRICE',
    plans: [
      {
        id: 'light',
        name: 'ライト',
        price: 'TODO_PRICE',
        features: [
          '週1回の面談（学習計画／振り返り／次週の修正）',
          '教材・優先順位の整理（迷いを減らす設計）',
          '必要に応じたチャット相談（実行が止まった時の立て直し）',
        ],
      },
      {
        id: 'standard',
        name: 'スタンダード',
        price: 'TODO_PRICE',
        features: [
          '週1回の面談（学習計画／振り返り／次週の修正）',
          '日々のチャット伴走（状況に応じて）',
          '教材設計・学習記録の整理（継続負荷を下げる工夫）',
        ],
      },
    ],
  },
  analytics: {
    enabled: false,
    snippet: 'TODO_ANALYTICS_SNIPPET',
  },
} as const;

export type CTAKind = 'line' | 'booking';

export function normalizePathname(pathname: string) {
  if (!pathname || pathname === '/') return '/';
  return pathname.replace(/\/+$/, '');
}

export function canonicalUrl(pathname: string) {
  const normalized = normalizePathname(pathname);
  const base = config.site.canonicalBase.endsWith('/')
    ? config.site.canonicalBase
    : `${config.site.canonicalBase}/`;
  const path = normalized === '/' ? '' : normalized.replace(/^\//, '');
  return new URL(path, base).toString();
}

export function ogImageUrl(pathname: string = config.site.defaultOgImagePath) {
  return canonicalUrl(pathname);
}

export function withAmazonAffiliateTag(url: string) {
  const normalized = new URL(url);
  const host = normalized.hostname.replace(/^www\./, '');
  if (host === 'amzn.to') {
    return normalized.toString();
  }

  const associateTag = config.affiliate.amazonAssociateTag.trim();
  const hasValidTag = Boolean(associateTag) && !associateTag.startsWith('TODO_');

  if (hasValidTag) {
    normalized.searchParams.set('tag', associateTag);
    normalized.searchParams.set('linkCode', 'll2');
  }

  return normalized.toString();
}
