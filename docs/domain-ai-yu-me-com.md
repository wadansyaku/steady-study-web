# `ai-yu-me.com` を Cloudflare Pages に接続する

対象プロジェクト: `aiyume-web`（Pages）

## 前提

- canonical domain は `https://ai-yu-me.com`
- AIYouMe の正規ルートは Pages 側で配信する
- `NanjyoEnglishApp` は `/aiyume_english*` と `/api/*` を優先して処理する

## 1. DNS

Cloudflare DNS（Zone: `ai-yu-me.com`）で以下を設定します。

1. `www`
   - Type: `CNAME`
   - Target: `aiyume-web.pages.dev`
   - Proxy: ON
2. `@`
   - Type: `CNAME`
   - Target: `aiyume-web.pages.dev`
   - Proxy: ON

## 2. Pages Custom Domains

Pages プロジェクト `aiyume-web` に以下を追加します。

- `ai-yu-me.com`
- `www.ai-yu-me.com`

## 3. 推奨リダイレクト

- `www.ai-yu-me.com/*` → `ai-yu-me.com/*` に 301

## 4. NanjyoEnglishApp と同居する場合

長期運用の推奨構成:

- `NanjyoEnglishApp` の build base を `/aiyume_english/` に寄せる
- Worker route は次だけに絞る
  - `ai-yu-me.com/aiyume_english*`
  - `ai-yu-me.com/api/*`
  - `www.ai-yu-me.com/aiyume_english*`
  - `www.ai-yu-me.com/api/*`
- それ以外のルートは Pages が配信する

暫定構成:

- Worker が apex を受けつつ、`/aiyume_english*` と `/api/*` だけ自前処理
- それ以外は Pages へプロキシ

## 5. 確認項目

- `https://ai-yu-me.com/` が AIYouMe のトップページを返す
- `https://ai-yu-me.com/learning` `/studio` `/automation` が Pages 配信になる
- `https://ai-yu-me.com/creator/void-rush/` が same-origin `/api/voidrush` を使う
- `https://ai-yu-me.com/aiyume_english/` は NanjyoEnglishApp が返す
