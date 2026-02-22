# Antigravity Input Prompt (VOIDRUSH Production Debug)

以下をそのまま Antigravity に入力して使ってください。

```text
あなたはWebアプリの本番デバッグに強いシニアQAエンジニアです。
対象は VOIDRUSH（本番）です。

## 対象URL
- App: https://ai-yu-me.com/creator/void-rush/
- API Base: https://ai-yu-me.com/api/voidrush

## 目的
本番で導入した「認証強化 + API経路 + 進行データ保護」が壊れていないかを、
ユーザー操作ベースで再現確認し、失敗時は再現条件を特定する。

## 最重要チェック項目
1. 初回起動時にゲームが正常に開始できる（白画面・初期化エラーなし）
2. progression API が 404 にならない（/api/voidrush/* が応答する）
3. 認証ブートストラップが成功する（401ループなし）
4. progression/snapshot は Bearer なしだと 401 になる
5. progression/snapshot は Bearer ありだと 200 で返る
6. leaderboard の playerId に raw な player_*, session_* が露出しない（pilot_* 形式）
7. 通信断→復帰時にキュー再送で致命的エラーが出ない
8. gacha 実行時に失敗リトライ無限ループにならない

## 実施条件
- Desktop Chrome 相当
- Mobile viewport 390x844
- localStorage/cookie をクリアした初期状態から開始

## 実行手順
1. /creator/void-rush/ を開く
2. DevTools Network を開き Preserve log ON
3. 初回ロード直後の API 呼び出しを確認
4. バトル開始→1戦終了まで実行し、以下エンドポイントの status を確認
   - /progression/auth/bootstrap
   - /progression/snapshot
   - /progression/match-result
   - /progression/battlepass/exp
   - /progression/leaderboard
5. オフライン切替→オンライン復帰を行い、再送とUI状態を確認
6. leaderboard response の playerId 形式を確認

## 失敗判定（優先度高）
- [P1] /progression/auth/bootstrap が 4xx/5xx
- [P1] /progression/snapshot が Bearerありでも 401
- [P1] /api/voidrush/* が 404
- [P2] leaderboard に player_ 形式が露出
- [P2] オフライン復帰後に操作不能
- [P3] 軽微な表示崩れや文言不一致

## 出力フォーマット
次の形式で報告すること。

[P1|P2|P3] Area: <route or feature>
Issue: <何が起きたか>
Repro Steps: <最短手順>
Expected: <本来の期待値>
Actual: <実際の結果>
Evidence: <network request URL / status / response抜粋>
Hypothesis: <原因仮説>
Fix Proposal: <最小修正案>

最後に、
- 「リリース継続可否（Go/No-Go）」
- 「即時修正が必要な上位3件」
を必ず出力してください。
```
