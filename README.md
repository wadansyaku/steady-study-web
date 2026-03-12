# AIYouMe Platform

AIYouMe の公開サイト基盤です。主系は `apps/web` の `Next.js App Router + OpenNext + Cloudflare Workers` で、共通 UI とコンテンツ取得層は workspace package に分離しています。`VOID-RUSH` は `services/voidrush` に切り出し、公開サイト本体からは labs 導線として扱います。

## Workspace

- `apps/web`: 公開サイト本体。`/learning` `/studio` `/automation` `/about` `/profile` `/case-studies` `/process` `/pricing` `/faq` `/security` `/terms` `/privacy` `/contact` `/cms`
- `packages/ui`: ロゴ、ブランドトークン、共通 UI
- `packages/content`: fallback data、Sanity schema、query、CMS loader、seed data
- `services/voidrush`: labs 配信用の実験サービス

## Setup

```bash
npm install
cp .env.example .env
```

主な環境変数:

- `NEXT_PUBLIC_SITE_URL`
- `NEXT_PUBLIC_LINE_URL`
- `NEXT_PUBLIC_BOOKING_URL`
- `NEXT_PUBLIC_CONTACT_EMAIL`
- `NEXT_PUBLIC_LABS_URL`
- `NEXT_PUBLIC_SANITY_PROJECT_ID`
- `NEXT_PUBLIC_SANITY_DATASET`
- `NEXT_PUBLIC_TURNSTILE_SITE_KEY`
- `TURNSTILE_SECRET_KEY`
- `RESEND_API_KEY`
- `RESEND_FROM_EMAIL`
- `LEAD_NOTIFICATION_EMAIL`
- `SANITY_API_READ_TOKEN`
- `SANITY_API_WRITE_TOKEN`

公開面の設定優先順位は `Sanity globalSettings > NEXT_PUBLIC_* fallback > packages/content/src/site-data.ts` です。

## Local Development

```bash
npm run dev
```

- `apps/web` が起動します
- `/cms` は `NEXT_PUBLIC_SANITY_PROJECT_ID` があれば embedded Studio、なければ schema 案内ページを表示します

## Validation

```bash
npm run lint
npm run typecheck
npm run build
npm run test:e2e
```

必要なら Playwright Chromium を先に入れます。

```bash
npx playwright install chromium
```

## CMS

Sanity に fallback data を投入する場合:

```bash
npm run cms:seed -- --dry-run
npm run cms:seed
```

- `--dry-run` は投入対象 `_id` を表示するだけで書き込みません
- 実行時は `NEXT_PUBLIC_SANITY_PROJECT_ID` と `SANITY_API_WRITE_TOKEN` が必要です
- stable `_id` は `globalSettings.main`、`homePage.main`、`servicePage.*`、`caseStudy.*`、`faqItem.*` などに固定しています

## Cloudflare Workers

公開サイトは `apps/web` を OpenNext 経由で Workers へ載せます。

```bash
cd apps/web
npm run build
npm run preview
```

手動デプロイ:

```bash
npm run db:migrate
npm run deploy
npm run db:migrate:preview
npm run deploy:preview
```

本番前に必要な設定:

1. `apps/web/wrangler.toml` の public vars を実値へ更新
2. D1 binding `LEADS_DB` を用意
3. `TURNSTILE_SECRET_KEY` `RESEND_API_KEY` `RESEND_FROM_EMAIL` `LEAD_NOTIFICATION_EMAIL` を secret として投入
4. Sanity を有効化する場合は `NEXT_PUBLIC_SANITY_PROJECT_ID` と必要な token を設定

lead table migration は `apps/web/migrations/0001_leads.sql` を使います。

## GitHub Actions

- `ci.yml`: lint / typecheck / build / Playwright E2E
- `deploy-web.yml`: `main` push または `workflow_dispatch` で Cloudflare Workers へ deploy
- `lighthouse-web.yml`: Lighthouse CI
- `voidrush-daily-rollup.yml`: VOID-RUSH ops の日次実行

`deploy-web.yml` は fail-fast です。最低限次が必要です。

- GitHub secret: `CLOUDFLARE_API_TOKEN`
- GitHub variable: `CLOUDFLARE_ACCOUNT_ID`

## Legacy And Labs

- `/education` -> `/learning`
- `/creator` -> `/studio`
- `/creator/void-rush/*` -> `https://labs.ai-yu-me.com/void-rush/*`

`services/voidrush` は root の `public/creator/void-rush`、`functions`、`migrations` を同期元として使います。
