# 実装の設計（Astro / 静的）

## ファイルツリー

```
.
├─ astro.config.mjs
├─ package.json
├─ tsconfig.json
├─ .gitignore
├─ public/
│  ├─ favicon.svg
│  └─ og.svg
├─ src/
│  ├─ config.ts
│  ├─ env.d.ts
│  ├─ styles/
│  │  └─ global.css
│  ├─ layouts/
│  │  └─ BaseLayout.astro
│  ├─ components/
│  │  ├─ Header.astro
│  │  ├─ Footer.astro
│  │  ├─ CTAButton.astro
│  │  └─ FAQAccordion.astro
│  └─ pages/
│     ├─ index.astro
│     ├─ education.astro
│     ├─ creator.astro
│     ├─ automation.astro
│     ├─ privacy.astro
│     ├─ contact.astro
│     ├─ 404.astro
│     ├─ robots.txt.ts
│     └─ sitemap.xml.ts
└─ docs/
   ├─ copywriting.md
   └─ deploy-cloudflare-pages.md
```

## 設定は `src/config.ts` に集約

- ドメイン：`domain`（ここだけ差し替えれば canonical/robots/sitemap も更新されます）
- 公式LINE：`config.urls.lineAddFriend`
- 予約URL：`config.urls.booking`
- 連絡メール：`config.contact.email`
- 料金：`config.education.pricePlaceholder` / `config.education.plans[].price`
- 解析タグ：`config.analytics.enabled` / `config.analytics.snippet`

### `src/config.ts`

```ts
const domain = 'ai-yu-me.com';

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
    creator: 'AIYuMe Studio',
    automation: 'AIYuMe Automation',
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
```

## ページ（必須構成）

- `/`：教育を主役にしつつ、3本柱へ分岐
- `/education`：LP（親の不安→信頼→CTA）
- `/creator`：簡潔（提供物・制作例プレースホルダ・相談導線）
- `/automation`：簡潔（提供領域・進め方・問い合わせ導線）
- `/privacy`：外部サービス/解析を想定したポリシー
- `/contact`：LINEを主、メールは補助
- `404`：静的404

## コンポーネント

- `src/components/Header.astro`：ナビ（AIYuMe Learning / Studio / Automation）＋右端LINE CTA
- `src/components/Footer.astro`：`/privacy` `/contact` ＋コピーライト
- `src/components/CTAButton.astro`：`line` / `booking` の2種
- `src/components/FAQAccordion.astro`：`<details>` ベースの簡易アコーディオン

## SEO最低限

- `src/layouts/BaseLayout.astro`：title/description、canonical、OGP、favicon
- `src/pages/robots.txt.ts`：`src/config.ts` のドメインから生成
- `src/pages/sitemap.xml.ts`：固定ページ一覧から生成

## CSS

- `src/styles/global.css`：ベース/ボタン/グリッド/カード
- ページ固有：各 `src/pages/*.astro` の `<style>`（必要最小）

## npm scripts

`package.json`

- `npm run dev`：ローカル開発
- `npm run build`：静的ビルド（`dist/`）
- `npm run preview`：ビルド結果の確認
