# Cloudflare Pages デプロイ手順

## 1. ローカル確認

```bash
npm install
cp .env.example .env
npm run dev
```

公開前には `.env` を実値へ置き換えてください。

## 2. ビルドと検証

```bash
npm run build
npm run validate:build
```

出力先は `dist/` です。

## 3. Pages 設定

- Framework preset: Astro
- Build command: `npm run build`
- Build output directory: `dist`

GitHub Actions では build 後に `npm run validate:build` を実行します。Pages 側の本番/preview 環境でも同じ env キーを設定してください。

## 4. Pages 環境変数

必須:

- `PUBLIC_SITE_URL`
- `PUBLIC_LINE_URL`
- `PUBLIC_BOOKING_URL`
- `PUBLIC_CONTACT_EMAIL`
- `PUBLIC_ANALYTICS_ENABLED`
- `PUBLIC_ANALYTICS_SNIPPET`
- `PUBLIC_VOIDRUSH_API_BASE_URL`

任意:

- `PUBLIC_AMAZON_ASSOCIATE_TAG`

推奨値:

- `PUBLIC_SITE_URL=https://ai-yu-me.com`
- `PUBLIC_VOIDRUSH_API_BASE_URL=/api/voidrush`

## 5. VOID-RUSH API (D1) の準備

`/creator/void-rush/` を公開する場合は D1 マイグレーションを適用します。

```bash
npm run cf:d1:migrate:remote:prod
npm run cf:d1:migrate:remote:preview
```

ローカルで Pages Functions ごと確認する場合:

```bash
npm run cf:d1:migrate:local
npm run cf:pages:dev
```

ops API まで確認する場合:

```bash
npm run cf:pages:dev:ops
```

主な API:

- `/api/voidrush/time`
- `/api/voidrush/progression/snapshot`
- `/api/voidrush/progression/match-result`
- `/api/voidrush/progression/leaderboard`
- `/api/voidrush/progression/season`

## 6. VOID-RUSH 運用 API

`VOIDRUSH_OPS_TOKEN` を Pages Project Settings の Environment Variables に設定してください。

- `/api/voidrush/ops/daily-rollup`
- `/api/voidrush/ops/rollups`
- `/api/voidrush/ops/anomalies`
- `/api/voidrush/ops/season-rollover`

ローカル例:

```bash
export VOIDRUSH_OPS_TOKEN=dev-token
npm run cf:pages:dev
curl -H "x-ops-token: dev-token" "http://127.0.0.1:8788/api/voidrush/ops/daily-rollup"
```

## 7. 日次自動実行

`/.github/workflows/voidrush-daily-rollup.yml` が UTC 00:15 に `/ops/daily-rollup` を実行します。必要な Secrets:

- `VOIDRUSH_BASE_URL`
- `VOIDRUSH_OPS_TOKEN`

## 8. 独自ドメイン

Cloudflare Pages の Custom domains で以下を設定します。

1. `ai-yu-me.com`
2. `www.ai-yu-me.com`

推奨:

- `www.ai-yu-me.com` → `ai-yu-me.com` に 301 リダイレクト
- SSL/TLS は `Full (strict)`
