# Antigravity Runbook (VOIDRUSH Debug)

## 使うファイル
- Prompt: `docs/antigravity-voidrush-debug-prompt-v2.md`
- Matrix: `docs/antigravity-voidrush-test-matrix.md`
- API smoke: `scripts/voidrush_prod_smoke.sh`

## 実行順
1. 先にAPI契約チェック
```bash
./scripts/voidrush_prod_smoke.sh
```

2. Antigravityに v2 prompt を貼り付け
- `docs/antigravity-voidrush-debug-prompt-v2.md` をそのまま投入
- Mode C（Deep）で実行を指示

3. 出力の評価
- FindingsにID（`VR-*`）がない場合は再提出
- P1が1件でも失敗なら No-Go

## 失敗時の戻し方（最短）
1. 失敗ケースIDを記録
2. 失敗ケースの再現手順だけで再試行
3. request/status/response の3点が揃うまで再収集
4. その情報をCodexへ渡して修正

## Codexに渡すテンプレ
```text
以下のケースで失敗。修正してください。
- ID: VR-XXXX
- Repro: ...
- request: ...
- status: ...
- response: ...
- console: ...
```
