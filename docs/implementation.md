# 実装メモ（AIYouMe 公開サイト）

## 現在の前提

- 主系: `apps/web` の `Next.js App Router + OpenNext + Cloudflare Workers`
- fallback content: `packages/content/src/site-data.ts`
- CMS layer: `packages/content/src/loaders.ts`
- schema / query: `packages/content/src/schemas.ts`, `packages/content/src/queries.ts`
- labs: `services/voidrush`

root の Astro ソースと Pages 固有 artifact は移行残骸であり、main site の実装ソースではありません。

## コンテンツ取得の優先順位

公開面は sync data を直接読まず、`@aiyoume/content` の async loader を使います。

優先順位:

1. Sanity document
2. `NEXT_PUBLIC_*` / token 由来の fallback
3. `packages/content/src/site-data.ts`

対象 loader:

- `getGlobalSettings()`
- `getHomePage()`
- `getServicePage()`
- `getAllServicePages()`
- `getCaseStudies()`
- `getCaseStudy()`
- `getFaqItems()`
- `getAboutPage()`
- `getProfilePage()`
- `getProcessPage()`
- `getPricingPage()`
- `getSecurityPage()`
- `getPolicyPage()`

## Sanity

singletons:

- `globalSettings.main`
- `homePage.main`
- `aboutPage.main`
- `profilePage.main`
- `processPage.main`
- `pricingPage.main`
- `securityPage.main`
- `policyPage.terms`
- `policyPage.privacy`

collections:

- `servicePage.<serviceKey>`
- `caseStudy.<slug>`
- `faqItem.<slug>`

seed:

```bash
npm run cms:seed -- --dry-run
npm run cms:seed
```

## 公開面

- layout は global settings を読み、header / footer / JSON-LD / metadata に流す
- contact form の連絡先は global settings を優先する
- service / case study / FAQ / policy などの本文は loader 経由で取得する
- `lead-route` は不正 `service` を 500 ではなく 404 JSON で返す

## 検証

```bash
npm run lint
npm run typecheck
npm run build
npm run test:e2e
```

E2E では主要公開ページ、metadata / JSON-LD、lead form、legacy redirect、visual regression を確認します。
