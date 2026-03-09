# AIYouMe Web (Astro / Cloudflare Pages)

AIYouMe の公開サイトです。現在の正規導線は `/learning` `/studio` `/automation` で、`/education` `/creator` は legacy route として維持しています。`/creator/void-rush/` は Studio 配下の実験コンテンツです。

## Setup

```bash
npm install
cp .env.example .env
```

必須の公開設定は build-time env で管理します。

- `PUBLIC_SITE_URL`
- `PUBLIC_LINE_URL`
- `PUBLIC_BOOKING_URL`
- `PUBLIC_CONTACT_EMAIL`
- `PUBLIC_ANALYTICS_ENABLED`
- `PUBLIC_ANALYTICS_SNIPPET`
- `PUBLIC_VOIDRUSH_API_BASE_URL`
- `PUBLIC_AMAZON_ASSOCIATE_TAG`（任意）

## Development

```bash
npm run dev
```

dev では `.env.example` の値を流用できます。公開用ビルドでは実値を設定してください。

## Build And Validation

```bash
npm run build
npm run validate:build
```

出力先は `dist/` です。`validate:build` は以下を確認します。

- `TODO_` / `NEW_DOMAIN` / `AIYuMe` が build 成果物に残っていない
- `robots.txt` と `sitemap.xml` が canonical domain を向く
- VOID-RUSH の asset 参照が実在し、API base が same-origin `/api/voidrush` を使う

## Cloudflare Pages

- Framework preset: Astro
- Build command: `npm run build`
- Output directory: `dist`
- CI では build 後に `npm run validate:build` を実行します

## Notes

- pricing は当面「無料面談後にご提案」で固定し、公開面で数値 placeholder は出しません。
- `/api/voidrush/*` のサーバー契約は変えていません。変更したのはクライアント既定の base URL だけです。
