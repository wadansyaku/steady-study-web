# 実装メモ（AIYouMe 公開サイト）

## 現在の前提

- 正規ルート: `/`, `/learning`, `/studio`, `/automation`, `/articles`, `/contact`, `/privacy`, `/creator/void-rush/`
- legacy route: `/education`, `/creator`
- ブランド表記: `AIYouMe`
- canonical domain: `https://ai-yu-me.com`

## 設定の単一ソース

公開設定は `src/config.ts` と `src/env.d.ts` に集約しています。ハードコードではなく build-time env で供給します。

必須 env:

- `PUBLIC_SITE_URL`
- `PUBLIC_LINE_URL`
- `PUBLIC_BOOKING_URL`
- `PUBLIC_CONTACT_EMAIL`
- `PUBLIC_ANALYTICS_ENABLED`
- `PUBLIC_ANALYTICS_SNIPPET`
- `PUBLIC_VOIDRUSH_API_BASE_URL`

任意 env:

- `PUBLIC_AMAZON_ASSOCIATE_TAG`

dev では `.env.example` の値を fallback として利用できます。non-dev build では必須 env 未設定時に失敗します。

## サイト構成

### ページ

- `/`:
  - ブランド全体の入口
  - 3事業を並列で見せるが、過度な送客はしない
- `/learning`:
  - 受験・学習伴走の主導線
  - pricing は「無料面談後にご提案」
- `/studio`:
  - 制作相談の導線
  - VOID-RUSH は「実験コンテンツ」として補助導線で扱う
- `/automation`:
  - 法人向け AI 自動化支援
- `/creator/void-rush/`:
  - 配布物として公開する実験コンテンツ
  - API base は same-origin `/api/voidrush`
- `/education`, `/creator`:
  - noindex の移行ページ
  - `public/_redirects` で 301 を設定

### SEO

- `BaseLayout.astro` が title / description / canonical / OGP を出力
- `robots.txt.ts` は canonical sitemap のみを出力
- `sitemap.xml.ts` は正規ルートのみを含む

## VOID-RUSH の扱い

- この repo では `public/creator/void-rush` を build 済み配布物として扱います
- ソース移管や再ビルド基盤の整備は別トラックです
- 変更対象は最小限:
  - preview domain 固定値の除去
  - asset 参照整合
  - 公開検証

## CI / 検証

- `npm run lint`
- `npm run typecheck`
- `npm run build`
- `npm run validate:build`

`scripts/validate_build.mjs` では以下を確認します。

- build 成果物に `TODO_`, `NEW_DOMAIN`, `AIYuMe`, preview-domain API base が残っていない
- `robots.txt` / `sitemap.xml` が canonical domain を向く
- VOID-RUSH asset 参照が実在する
- VOID-RUSH bundle が `/api/voidrush` を使う
