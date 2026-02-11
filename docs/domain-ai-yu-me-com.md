# `ai-yu-me.com` を Cloudflare Pages に接続する（具体手順）

対象プロジェクト: `aiyume-web`（Pages）

現状ステータス:
- `ai-yu-me.com`: pending（CNAME record not set）
- `www.ai-yu-me.com`: pending（CNAME record not set）

## 0) 重要: `NanjyoEnglishApp` と同居する場合

`NanjyoEnglishApp` 側は現在 `ai-yu-me.com/*` と `www.ai-yu-me.com/*` を
Workerで丸ごと受けています（`/Users/Yodai/projects/NanjyoEnglishApp/wrangler.toml`）。

このままでは、新しいトップサイト（Pages）が同じドメインにいても、
実際のリクエストはWorker側に吸われます。

同居するには次のどちらかが必要です。

1. 推奨: `NanjyoEnglishApp` のビルドベースを `/aiyume_english/` に寄せる
2. 暫定: Workerルートを細かく分割して必要パスだけ残す

## 1) DNS レコード（必須）

Cloudflare DNS（Zone: `ai-yu-me.com`）で以下を設定してください。

1. `www`（サブドメイン）
   - Type: `CNAME`
   - Name: `www`
   - Target: `aiyume-web.pages.dev`
   - Proxy: ON（推奨）

2. `@`（apex / ルートドメイン）
   - Type: `CNAME`
   - Name: `@`
   - Target: `aiyume-web.pages.dev`
   - Proxy: ON（推奨）

補足:
- Cloudflare は apex でも `CNAME` を受け付け、裏側で Flattening されます。
- 既に `A`/`AAAA` がある場合は衝突するので削除してください。

## 2) Pages 側の Custom Domains

Pages プロジェクト `aiyume-web` の **Custom domains** に以下2つが入っていることを確認します。

- `ai-yu-me.com`
- `www.ai-yu-me.com`

（入っていなければ追加）

## 3) リダイレクト（推奨）

- `www.ai-yu-me.com` → `ai-yu-me.com` に 301 リダイレクト

設定場所は Pages の UI 側が早いです（Custom domains か Redirects）。

## 4) SSL/TLS（推奨）

- SSL/TLS mode: `Full (strict)`

## 5) 確認

DNS 設定後、数分〜最大で数十分で Pages 側の `pending` が `active` になります。

## 6) 現在の実装（復旧優先の同居構成）

DNS 書き込み権限が無い環境でも運用を止めないため、現在は次の構成で稼働中です。

- `nanjyoenglishapp` Worker が `ai-yu-me.com/*` / `www.ai-yu-me.com/*` を受ける
- `www.ai-yu-me.com/*` は `ai-yu-me.com/*` に 301
- `/aiyume_english*` と `/api/*` は `NanjyoEnglishApp` が処理
- それ以外のパス（`/`, `/education` など）は `https://aiyume-web.pages.dev` へプロキシ

この構成で、

- `https://ai-yu-me.com/` は AIYuMe（新サイト）
- `https://ai-yu-me.com/aiyume_english/` は AIYuMe English

を同時に維持できます。

## 7) 最終形（DNS設定できるとき）

### A. 推奨（長期運用）

`NanjyoEnglishApp` 側:

- `vite.config.ts` に `base: '/aiyume_english/'` を設定
- 再ビルド/再デプロイ
- Worker route は次だけにする
  - `ai-yu-me.com/aiyume_english*`
  - `ai-yu-me.com/api/*`
  - `www.ai-yu-me.com/aiyume_english*`
  - `www.ai-yu-me.com/api/*`

`AIYuMe` 側（Pages）:

- `ai-yu-me.com` / `www.ai-yu-me.com` をCustom domainに設定
- ルートページはPagesが配信

### B. 暫定（既存ビルドを変えない）

`NanjyoEnglishApp` の静的資産がルート配下（`/assets`, `/sw.js`, `/manifest.webmanifest` 等）を使っているため、
Worker route を絞る場合は必要アセットのルートも個別に残す必要があります。

この方式は運用が複雑になるため、最終的には A へ移行するのが安全です。
