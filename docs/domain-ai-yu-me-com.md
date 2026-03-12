# `ai-yu-me.com` を Cloudflare Workers に接続する

対象: `apps/web` を OpenNext 経由で deploy した Worker

## 前提

- canonical domain は `https://ai-yu-me.com`
- 公開サイト本体は Worker が返す
- `labs.ai-yu-me.com` は `VOID-RUSH` など実験系の分離先として使う

## 1. Worker 側

- production worker に `ai-yu-me.com/*` を接続
- 必要なら `www.ai-yu-me.com/*` も接続し、どちらを canonical にするか決める
- `workers_dev = false` のまま route / custom domain を使う

## 2. DNS

Cloudflare DNS で Worker / Custom Domain の指示に従って apex と `www` を接続します。実際の record 形式は Workers 側の current setup に合わせます。

## 3. 推奨リダイレクト

- `www.ai-yu-me.com/*` -> `ai-yu-me.com/*` に 301
- `/education` -> `/learning`
- `/creator` -> `/studio`
- `/creator/void-rush/*` -> `https://labs.ai-yu-me.com/void-rush/*`

## 4. 確認項目

- `https://ai-yu-me.com/` が AIYouMe トップを返す
- `https://ai-yu-me.com/learning` `/studio` `/automation` が Worker 配信になる
- `https://ai-yu-me.com/contact` の canonical と JSON-LD が正しい
- `https://ai-yu-me.com/creator/void-rush/demo` が labs へ 3xx redirect する
- `https://ai-yu-me.com/cms` は Sanity env の有無に応じて Studio または schema 案内を返す
