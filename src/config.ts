const domain = 'TODO_DOMAIN';

export const config = {
  site: {
    name: 'Steady Study',
    domain,
    canonicalBase: `https://${domain}`,
    defaultOgImagePath: '/og.svg',
  },
  urls: {
    lineAddFriend: 'TODO_LINE_URL',
    booking: 'TODO_BOOKING_URL',
  },
  contact: {
    email: 'TODO_CONTACT_EMAIL',
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
