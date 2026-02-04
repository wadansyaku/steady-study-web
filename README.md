# Steady Study Web (Astro / Static)

教育LPを中心にした静的サイトです。v1はサーバー処理なし（LINE/外部予約/メールで運用）を前提にしています。

## 1) セットアップ

```bash
npm install
```

## 2) 開発

```bash
npm run dev
```

## 3) ビルド

```bash
npm run build
```

出力先は `dist/` です。

## 4) 設定（TODO差し替え）

`src/config.ts` の以下を差し替えてください。

- `config.site.domain`
- `config.urls.lineAddFriend`
- `config.urls.booking`
- `config.contact.email`
- `config.education.pricePlaceholder` / `config.education.plans[].price`
- `config.analytics.enabled` / `config.analytics.snippet`

## 5) Cloudflare Pages

- Framework preset: Astro
- Build command: `npm run build`
- Output directory: `dist`
