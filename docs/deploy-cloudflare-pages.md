# Cloudflare Workers デプロイ手順

この repo の公開サイト本体は `apps/web` の `Next.js App Router + OpenNext + Cloudflare Workers` を前提に運用します。Pages / Astro の手順は現在の主系ではありません。

## 1. ローカル確認

```bash
npm install
cp .env.example .env
npm run dev
```

## 2. 品質確認

```bash
npm run lint
npm run typecheck
npm run build
npm run test:e2e
```

## 3. OpenNext / Workers 確認

```bash
cd apps/web
npm run build
npm run preview
```

`preview` は `opennextjs-cloudflare build && wrangler dev` を実行します。

## 4. 必要な設定

public vars:

- `NEXT_PUBLIC_SITE_URL`
- `NEXT_PUBLIC_LINE_URL`
- `NEXT_PUBLIC_BOOKING_URL`
- `NEXT_PUBLIC_CONTACT_EMAIL`
- `NEXT_PUBLIC_LABS_URL`
- `NEXT_PUBLIC_SANITY_DATASET`
- `NEXT_PUBLIC_SANITY_PROJECT_ID`（CMS を使う場合）
- `NEXT_PUBLIC_TURNSTILE_SITE_KEY`（Turnstile を使う場合）

secrets:

- `TURNSTILE_SECRET_KEY`
- `RESEND_API_KEY`
- `RESEND_FROM_EMAIL`
- `LEAD_NOTIFICATION_EMAIL`
- `SANITY_API_READ_TOKEN`（必要な場合）
- `SANITY_API_WRITE_TOKEN`（seed / write が必要な場合）

## 5. D1 migration

lead form 用 D1 は `apps/web/migrations/0001_leads.sql` を使います。

```bash
npm run db:migrate
npm run db:migrate:preview
```

## 6. Deploy

手動:

```bash
npm run deploy
npm run deploy:preview
```

GitHub Actions:

- `/.github/workflows/deploy-web.yml`
- 必須: `CLOUDFLARE_API_TOKEN`, `CLOUDFLARE_ACCOUNT_ID`

workflow は fail-fast で、認証情報が足りなければその場で失敗します。

## 7. Sanity seed

CMS を有効化する前に fallback data を seed する場合:

```bash
npm run cms:seed -- --dry-run
npm run cms:seed
```

必要 env:

- `NEXT_PUBLIC_SANITY_PROJECT_ID`
- `NEXT_PUBLIC_SANITY_DATASET`
- `SANITY_API_WRITE_TOKEN`

## 8. VOID-RUSH

公開サイト本体は `/creator/void-rush/*` を labs へ redirect します。`services/voidrush` は別トラックで運用します。
