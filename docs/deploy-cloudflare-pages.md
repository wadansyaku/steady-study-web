# Cloudflare Pages デプロイ手順（Astro / Static）

## 1) ローカル実行

```bash
npm install
npm run dev
```

## 2) ビルド

```bash
npm run build
```

出力先は `dist/` です。

## 3) GitHub 連携（前提）

1. このリポジトリを GitHub に push
2. Cloudflare Dashboard → **Workers & Pages** → **Create application** → **Pages** → **Connect to Git**
3. 対象リポジトリを選択し、プロジェクトを作成
4. 既に CLI で作成済みの場合は `aiyume-web` をそのまま利用（`https://aiyume-web.pages.dev`）

## 4) Cloudflare Pages のビルド設定

- **Framework preset**: Astro
- **Build command**: `npm run build`
- **Build output directory**: `dist`

（もし preset が効かない場合でも、上記を手入力でOKです）

## 5) 公開後にやること（重要）

`src/config.ts` を差し替えます。

- `domain`：`ai-yu-me.com`
- `config.urls.lineAddFriend`：`TODO_LINE_URL` → 公式LINE追加URL
- `config.urls.booking`：`TODO_BOOKING_URL` → 予約ページURL
- `config.contact.email`：`TODO_CONTACT_EMAIL` → 連絡用メール
- 料金：`config.education.pricePlaceholder` と `config.education.plans[].price`
- 解析：`config.analytics.enabled` / `config.analytics.snippet`（使うならON）

## 6) 独自ドメイン接続（概要）

Cloudflare Pages の **Custom domains** から次の2つを追加します。

1. `ai-yu-me.com`（apex）
2. `www.ai-yu-me.com`（www）

推奨運用：

- `www.ai-yu-me.com` を `ai-yu-me.com` に 301 リダイレクト
- SSL/TLS は `Full (strict)`

DNS は Cloudflare 側が案内する設定に従ってください。通常は次の形です。

- **CNAME**：`www` → `<your-project>.pages.dev`
- **apex**（`@`）：Cloudflare の CNAME Flattening を使って `<your-project>.pages.dev` に向ける
