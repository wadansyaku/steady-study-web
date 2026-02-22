# VOID-RUSH フェーズ実装状況

## Phase 1（完了）

- クライアントにAPI層を追加
- サーバー時刻同期
- 進行イベント送信（match / mission / login bonus / battle pass / gacha）
- オフライン再送キュー

## Phase 2（完了）

- Cloudflare D1 を実DBで作成
- `wrangler.toml` に D1 binding を設定
- `migrations/0001_voidrush.sql` を追加
- `functions/api/voidrush/*` をスタブから永続化APIへ置換
- `/progression/snapshot` 実装（初回bootstrap対応）

## Phase 3（完了）

- リクエストIDベースの冪等化（`voidrush_requests`）
- ミッション/ログボ/バトルパスのサーバー側検証
- 日次ミッションのサーバー日付ベース管理

## Phase 4（完了）

- leaderboard API（`/progression/leaderboard`）
- `/creator` ページにランキング表示を追加

## Phase 5（次の候補）

- D1生データからシーズン切替（`season_id`）
- 不正検知ルール（急激な通貨増加・異常スコア）
- Cron Trigger で日次集計/アーカイブ
- Cloudflare Analytics Engine 連携
