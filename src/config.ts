const siteName = 'AIYouMe';

const DEV_FALLBACKS = {
  PUBLIC_SITE_URL: 'https://ai-yu-me.com',
  PUBLIC_LINE_URL: 'https://line.me/',
  PUBLIC_BOOKING_URL: 'https://example.com/booking',
  PUBLIC_CONTACT_EMAIL: 'hello@ai-yu-me.com',
  PUBLIC_ANALYTICS_ENABLED: 'false',
  PUBLIC_ANALYTICS_SNIPPET: '',
  PUBLIC_VOIDRUSH_API_BASE_URL: '/api/voidrush',
  PUBLIC_AMAZON_ASSOCIATE_TAG: '',
} as const;

type PublicEnvKey = keyof typeof DEV_FALLBACKS;

function shouldUseDevFallback() {
  return import.meta.env.DEV;
}

function readPublicEnv(
  key: PublicEnvKey,
  options: {
    required?: boolean;
    allowEmpty?: boolean;
  } = {},
) {
  const { required = true, allowEmpty = false } = options;
  const rawValue = import.meta.env[key];
  const value = typeof rawValue === 'string'
    ? rawValue.trim()
    : shouldUseDevFallback()
      ? DEV_FALLBACKS[key]
      : '';

  if (value || allowEmpty) {
    return value;
  }

  if (!required) {
    return '';
  }

  throw new Error(`[config] ${key} is required for non-dev builds.`);
}

function readUrlEnv(key: Extract<PublicEnvKey, 'PUBLIC_SITE_URL' | 'PUBLIC_LINE_URL' | 'PUBLIC_BOOKING_URL'>) {
  const value = readPublicEnv(key);
  try {
    const normalized = new URL(value);
    normalized.hash = '';
    return normalized.toString();
  } catch {
    throw new Error(`[config] ${key} must be an absolute URL. Received: ${value}`);
  }
}

function readEmailEnv(key: Extract<PublicEnvKey, 'PUBLIC_CONTACT_EMAIL'>) {
  const value = readPublicEnv(key);
  const isValidEmail = /^[^\s@]+@[^\s@]+\.[^\s@]+$/.test(value);
  if (!isValidEmail) {
    throw new Error(`[config] ${key} must be a valid email address. Received: ${value}`);
  }
  return value;
}

function readBooleanEnv(key: Extract<PublicEnvKey, 'PUBLIC_ANALYTICS_ENABLED'>) {
  const value = readPublicEnv(key);
  if (['true', '1', 'yes', 'on'].includes(value.toLowerCase())) return true;
  if (['false', '0', 'no', 'off'].includes(value.toLowerCase())) return false;
  throw new Error(`[config] ${key} must be a boolean string. Received: ${value}`);
}

function readVoidRushApiBaseUrl() {
  const value = readPublicEnv('PUBLIC_VOIDRUSH_API_BASE_URL');
  const isAbsolute = /^https?:\/\//i.test(value);
  if (isAbsolute) {
    return value.replace(/\/+$/, '');
  }
  if (value.startsWith('/')) {
    return value.replace(/\/+$/, '') || '/';
  }
  throw new Error(
    `[config] PUBLIC_VOIDRUSH_API_BASE_URL must be an absolute URL or an absolute path. Received: ${value}`,
  );
}

const siteUrl = readUrlEnv('PUBLIC_SITE_URL').replace(/\/+$/, '');
const lineUrl = readUrlEnv('PUBLIC_LINE_URL');
const bookingUrl = readUrlEnv('PUBLIC_BOOKING_URL');
const contactEmail = readEmailEnv('PUBLIC_CONTACT_EMAIL');
const analyticsEnabled = readBooleanEnv('PUBLIC_ANALYTICS_ENABLED');
const analyticsSnippet = analyticsEnabled
  ? readPublicEnv('PUBLIC_ANALYTICS_SNIPPET')
  : readPublicEnv('PUBLIC_ANALYTICS_SNIPPET', { required: false, allowEmpty: true });
const voidRushApiBaseUrl = readVoidRushApiBaseUrl();
const amazonAssociateTag = readPublicEnv('PUBLIC_AMAZON_ASSOCIATE_TAG', {
  required: false,
  allowEmpty: true,
});
const siteDomain = new URL(siteUrl).hostname;

export const config = {
  site: {
    name: siteName,
    url: siteUrl,
    domain: siteDomain,
    canonicalBase: siteUrl,
    defaultOgImagePath: '/og.svg',
  },
  brands: {
    home: siteName,
    learning: `${siteName} Learning`,
    studio: `${siteName} Studio`,
    automation: `${siteName} Automation`,
    english: `${siteName} Learning English`,
  },
  seo: {
    routes: {
      home: {
        path: '/',
        title: siteName,
        description:
          'AIYouMeは、学習・制作・業務の3領域を共通メソッドで支援するブランドです。伴走・設計・実行・改善を一体で進めます。',
      },
      learning: {
        path: '/learning',
        title: `${siteName} Learning | ${siteName}`,
        description:
          '受験・学習伴走のAIYouMe Learning。親子の不安に寄り添い、計画から実行・改善まで再現性のある学習設計を行います。',
      },
      studio: {
        path: '/studio',
        title: `${siteName} Studio | ${siteName}`,
        description:
          '音楽制作・動画編集・クリエイティブ制作のAIYouMe Studio。要件整理から制作・改善まで、目的に沿って伴走します。',
      },
      automation: {
        path: '/automation',
        title: `${siteName} Automation | ${siteName}`,
        description:
          '法人向けAI自動化・業務設計・実装支援のAIYouMe Automation。課題整理から設計・実装・改善まで一貫して支援します。',
      },
    },
  },
  urls: {
    lineAddFriend: lineUrl,
    booking: bookingUrl,
    englishApp: `${siteUrl}/aiyume_english/auth`,
    consultations: {
      learningLine: lineUrl,
      studioLine: lineUrl,
      automationMail: `mailto:${contactEmail}`,
      automationLine: lineUrl,
    },
  },
  apps: {
    voidrush: {
      apiBaseUrl: voidRushApiBaseUrl,
      path: '/creator/void-rush/',
    },
  },
  contact: {
    email: contactEmail,
  },
  affiliate: {
    amazonAssociateTag,
    disclosure:
      '当サイトはアフィリエイト広告を利用しています。Amazonのアソシエイトとして、AIYouMe は適格販売により収入を得ています。',
    amazonLinks: {
      studyTimer: 'https://amzn.to/4rHUUZq',
      reviewBinder: 'https://amzn.to/3ZyFT06',
      deskLight: 'https://amzn.to/4auRN01',
      canareGs6Cable: 'https://amzn.to/4tA6Xd0',
    },
  },
  learning: {
    bookingNote: '週5枠限定（初回無料面談30分）',
    pricingNote: '料金は支援範囲と頻度に応じて、無料面談後にご提案します。',
    plans: [
      {
        id: 'light',
        name: 'ライト',
        price: '面談後にご提案',
        features: [
          '週1回の面談（学習計画／振り返り／次週の修正）',
          '教材・優先順位の整理（迷いを減らす設計）',
          '必要に応じたチャット相談（実行が止まった時の立て直し）',
        ],
      },
      {
        id: 'standard',
        name: 'スタンダード',
        price: '面談後にご提案',
        features: [
          '週1回の面談（学習計画／振り返り／次週の修正）',
          '日々のチャット伴走（状況に応じて）',
          '教材設計・学習記録の整理（継続負荷を下げる工夫）',
        ],
      },
    ],
  },
  analytics: {
    enabled: analyticsEnabled,
    snippet: analyticsSnippet,
  },
} as const;

export type CTAKind = 'line' | 'booking';
export type SeoRouteKey = keyof typeof config.seo.routes;

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

export function routeSeo(route: SeoRouteKey) {
  const seo = config.seo.routes[route];
  return {
    ...seo,
    canonical: canonicalUrl(seo.path),
  };
}

export function withAmazonAffiliateTag(url: string) {
  const normalized = new URL(url);
  const host = normalized.hostname.replace(/^www\./, '');
  if (host === 'amzn.to') {
    return normalized.toString();
  }

  const associateTag = config.affiliate.amazonAssociateTag.trim();
  if (associateTag) {
    normalized.searchParams.set('tag', associateTag);
    normalized.searchParams.set('linkCode', 'll2');
  }

  return normalized.toString();
}
