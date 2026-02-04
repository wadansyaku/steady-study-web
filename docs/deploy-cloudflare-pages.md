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

## 4) Cloudflare Pages のビルド設定

- **Framework preset**: Astro
- **Build command**: `npm run build`
- **Build output directory**: `dist`

（もし preset が効かない場合でも、上記を手入力でOKです）

## 5) 公開後にやること（重要）

`src/config.ts` を差し替えます。

- `domain`：`TODO_DOMAIN` → 実ドメイン
- `config.urls.lineAddFriend`：`TODO_LINE_URL` → 公式LINE追加URL
- `config.urls.booking`：`TODO_BOOKING_URL` → 予約ページURL
- `config.contact.email`：`TODO_CONTACT_EMAIL` → 連絡用メール
- 料金：`config.education.pricePlaceholder` と `config.education.plans[].price`
- 解析：`config.analytics.enabled` / `config.analytics.snippet`（使うならON）

## 6) 独自ドメイン接続（概要）

Cloudflare Pages の **Custom domains** から追加します。

- 既に Cloudflare でDNS管理している場合：画面の案内に従って追加（自動で設定されます）
- まだDNSが Cloudflare でない場合：ドメインのネームサーバーを Cloudflare に向けてから、Custom domains を追加

DNS レコードは最終的に以下のどちらかになります（UIが案内します）。

- **CNAME**：`www` → `<your-project>.pages.dev`
- ルートドメイン（`@`）：Cloudflare の推奨に従い、CNAME Flattening か A/AAAA を設定

