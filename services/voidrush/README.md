# VOID-RUSH Service Split

`VOID-RUSH` は本体の trust hub から切り離した labs サービスです。

この workspace は次の資産を受け持つ前提です。

- build 済みの公開アセット
- Cloudflare Functions / D1 migrations
- ops 用ドキュメントと smoke scripts

## Sync

```bash
npm run voidrush:sync
```

このコマンドは root 側の現行 `public/creator/void-rush`, `functions`, `migrations`
を service workspace 配下へ複製します。公開サイト本体は `/creator/void-rush/*`
を `https://labs.ai-yu-me.com/void-rush/*` へ redirect します。
