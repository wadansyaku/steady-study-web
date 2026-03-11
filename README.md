# AIYouMe Platform

AIYouMe の公開サイト基盤です。ブランド本体は `Next.js App Router + Cloudflare Workers`、UI とコンテンツ定義は workspace package に分離し、`VOID-RUSH` は `services/voidrush` へ切り出しています。

## Workspace

- `apps/web`: 公開サイト。`/learning` `/studio` `/automation` `/about` `/profile` `/case-studies` `/process` `/pricing` `/faq` `/security` `/terms` `/privacy` `/contact` を提供します。
- `packages/ui`: ブランドトークン、ロゴ variant、共通 UI。
- `packages/content`: サイトコンテンツ、Sanity schema、query/config。
- `services/voidrush`: labs 分離用の実験サービス。

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

## Local Development

```bash
npm run dev
```

`apps/web` が起動します。`/cms` は Sanity project id が設定されていれば embedded Studio を表示し、未設定時は schema 案内ページを表示します。

## Validation

```bash
npm run lint
npm run typecheck
npm run build
npm run test:e2e
```

E2E は Playwright で以下を確認します。

- desktop / mobile の主要公開ページ
- axe の重大違反 0
- canonical / JSON-LD
- legacy redirect
- first-party lead form
- logo-driven visual regression

初回のみブラウザを入れる場合:

```bash
npx playwright install chromium
```

## Cloudflare Workers

公開サイトは `apps/web` を OpenNext 経由で Workers へ載せます。

```bash
cd apps/web
npm run build
npm run preview
```

本番前に必要な設定:

1. `wrangler.toml` の公開変数を実値へ更新する
2. D1 binding `LEADS_DB` を追加する
3. `TURNSTILE_SECRET_KEY` `RESEND_API_KEY` `RESEND_FROM_EMAIL` `LEAD_NOTIFICATION_EMAIL` を secret として投入する
4. `NEXT_PUBLIC_SANITY_PROJECT_ID` を設定して `/cms` を有効化する

lead tables は `apps/web/migrations/0001_leads.sql` を使います。

手動デプロイ / migration:

```bash
npm run db:migrate
npm run deploy
npm run db:migrate:preview
npm run deploy:preview
```

## GitHub Integration

`main` push と `workflow_dispatch` 用に Cloudflare deploy workflow を追加しています。

- GitHub secret: `CLOUDFLARE_API_TOKEN`
- GitHub variable: `CLOUDFLARE_ACCOUNT_ID`

secret 未設定時は workflow が no-op で終了し、何が不足しているかだけ出力します。

Lighthouse CI workflow も追加しており、PR 上で performance / accessibility / SEO budget を確認できます。

## Current Cloudflare Status

- lead 用 D1 は `aiyoume-leads-prod` / `aiyoume-leads-preview` を作成済み
- migration は preview / production とも適用済み
- preview worker: `https://aiyoume-web-preview.kidsquestmissionjp.workers.dev`
- production worker: `https://aiyoume-web.kidsquestmissionjp.workers.dev`
- GitHub deploy workflow は追加済みだが、repo secret `CLOUDFLARE_API_TOKEN` はまだ未設定
- custom domain / route はまだ Workers 側に接続していない

## Legacy And Labs

- `/education` -> `/learning`
- `/creator` -> `/studio`
- `/creator/void-rush/*` -> `https://labs.ai-yu-me.com/void-rush/*`

`services/voidrush` には root から同期した資産があり、`npm run voidrush:sync` で再同期できます。
