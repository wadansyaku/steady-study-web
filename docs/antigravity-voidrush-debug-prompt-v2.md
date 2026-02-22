# Antigravity Input Prompt (VOIDRUSH Production Debug v2 - Deep)

以下をそのまま Antigravity に入力して使ってください。

```text
あなたは本番Webアプリの障害再現と原因切り分けに強いシニアQAエンジニアです。
対象は VOIDRUSH（Production）です。

## 対象
- App: https://ai-yu-me.com/creator/void-rush/
- API Base: https://ai-yu-me.com/api/voidrush
- 参照ドキュメント:
  - docs/voidrush-prod-smoke-check.md
  - docs/antigravity-voidrush-test-matrix.md

## ゴール
- 認証導入後の回帰（認証/同期/キュー/チュートリアル）を高精度で検出する
- 見つけた不具合を「再現可能な最短手順 + 根拠ログ + 修正方針」で報告する

## 実施ルール（厳守）
1. 1ケースごとに localStorage / sessionStorage / cookie を初期化してから開始
2. DevTools は Network Preserve Log を常時ON
3. すべてのNGケースは「再現2回」で確定
4. APIエラーは必ず status code と response body を記録
5. 推測だけで結論を出さない（Evidence優先）

## 実施モード
- Mode A (Quick): P1中心の12ケースのみ
- Mode B (Standard): P1+P2の全ケース
- Mode C (Deep): 全ケース + 異常系3種（改ざんトークン/ヘッダ不整合/オフライン復帰）

今回は Mode C で実施してください。

## 優先検証ポイント
1. API経路
- /api/voidrush/* が 404 にならない

2. 認証
- /progression/auth/bootstrap が成功する
- Bearerなし snapshot が 401
- Bearerあり snapshot が 200
- ヘッダ不整合（x-player-id mismatch）が 401

3. 同期
- tutorialDone が true になった後に再表示されない
- applyServerSnapshot 後に tutorialDone が false に戻らない

4. キュー
- オフライン中の送信失敗後、オンライン復帰で操作不能にならない
- リトライで無限ループやUIフリーズがない

5. データ露出
- leaderboard の playerId が pilot_* 形式
- player_* / session_* の生IDが response に含まれない

6. 静的アセット
- /favicon.ico が 200
- /creator/void-rush/favicon.svg が 200
- Consoleに favicon 404 が出ない

## 実行順序
1. 事前: docs/voidrush-prod-smoke-check.md の curl を実行（契約レベル）
2. ブラウザE2E: docs/antigravity-voidrush-test-matrix.md のケースID順に実施
3. 異常系: トークン改ざん・ヘッダ不整合・オフライン復帰
4. まとめ: 優先度順に Findings を出力

## Findings 出力フォーマット（必須）
[ID: VR-XXX] [P1|P2|P3] Area: <feature>
Issue: <症状>
Repro Steps: <最短3-7手順>
Expected: <期待>
Actual: <実測>
Evidence:
- request: <method + url>
- status: <code>
- response: <JSON抜粋>
- console: <必要なら抜粋>
Hypothesis: <原因仮説>
Fix Proposal: <最小修正>
Confidence: <0.0-1.0>

## 最終出力（必須）
1. Go / No-Go
2. 即時修正Top3（ID付き）
3. 再テストが必要なケースID一覧
4. 「再現できなかった項目」と不足情報
```
