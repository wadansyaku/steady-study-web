export type BrandAssetVariant =
  | 'logo-dark'
  | 'logo-light'
  | 'logo-mono'
  | 'mark'
  | 'mark-mono'
  | 'symbol'
  | 'lockup';

export type ServiceThemeKey = 'learning' | 'studio' | 'automation';

export type BrandAsset = {
  variant: BrandAssetVariant;
  src: string;
  width: number;
  height: number;
  alt: string;
  usage: string[];
};

export type ServiceTheme = {
  key: ServiceThemeKey;
  slug: string;
  label: string;
  shortLabel: string;
  accent: string;
  accentSoft: string;
  accentStrong: string;
  accentInk: string;
  surface: string;
  ring: string;
};

export const brandAssets: Record<BrandAssetVariant, BrandAsset> = {
  'logo-dark': {
    variant: 'logo-dark',
    src: '/brand/aiyoume-logo-dark.svg',
    width: 280,
    height: 76,
    alt: 'AIYouMe',
    usage: ['Header on light surfaces', 'Primary brand lockup'],
  },
  'logo-light': {
    variant: 'logo-light',
    src: '/brand/aiyoume-logo-light.svg',
    width: 280,
    height: 76,
    alt: 'AIYouMe',
    usage: ['Footer on dark surfaces', 'Inverse lockup'],
  },
  'logo-mono': {
    variant: 'logo-mono',
    src: '/brand/aiyoume-logo-mono.svg',
    width: 280,
    height: 76,
    alt: 'AIYouMe',
    usage: ['Single-color print', 'Contrast constrained placements'],
  },
  mark: {
    variant: 'mark',
    src: '/brand/aiyoume-mark.svg',
    width: 96,
    height: 96,
    alt: 'AIYouMe mark',
    usage: ['Service badges', 'Section markers', 'Favicons where detail is needed'],
  },
  'mark-mono': {
    variant: 'mark-mono',
    src: '/brand/aiyoume-mark-mono.svg',
    width: 96,
    height: 96,
    alt: 'AIYouMe mark',
    usage: ['Embossed or grayscale placements'],
  },
  symbol: {
    variant: 'symbol',
    src: '/brand/aiyoume-symbol.svg',
    width: 96,
    height: 96,
    alt: 'AIYouMe symbol',
    usage: ['Compact identity', 'OG motif', 'Hero motif'],
  },
  lockup: {
    variant: 'lockup',
    src: '/brand/aiyoume-lockup.svg',
    width: 280,
    height: 76,
    alt: 'AIYouMe',
    usage: ['Hero lockup', 'Narrative brand explainer'],
  },
};

export const serviceThemes: Record<ServiceThemeKey, ServiceTheme> = {
  learning: {
    key: 'learning',
    slug: 'learning',
    label: '学習支援',
    shortLabel: 'Learning',
    accent: '#EFA24C',
    accentSoft: '#FFF2E2',
    accentStrong: '#C77A1F',
    accentInk: '#6A3A03',
    surface: '#FFF9F3',
    ring: 'rgba(239, 162, 76, 0.28)',
  },
  studio: {
    key: 'studio',
    slug: 'studio',
    label: '制作支援',
    shortLabel: 'Studio',
    accent: '#43C796',
    accentSoft: '#EAFBF3',
    accentStrong: '#1B9666',
    accentInk: '#0F5A3C',
    surface: '#F4FFFA',
    ring: 'rgba(67, 199, 150, 0.24)',
  },
  automation: {
    key: 'automation',
    slug: 'automation',
    label: '業務自動化',
    shortLabel: 'Automation',
    accent: '#5DCBF3',
    accentSoft: '#EEF9FF',
    accentStrong: '#229CC8',
    accentInk: '#0B4E66',
    surface: '#F6FBFE',
    ring: 'rgba(93, 203, 243, 0.24)',
  },
};
