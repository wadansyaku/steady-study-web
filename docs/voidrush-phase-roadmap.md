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

## Phase 5（完了）

- `migrations/0002_voidrush_phase5.sql` で `season_id` / anomaly / rollup / archive テーブルを追加
- 月次シーズンID（`SYYYYMM`）を自動解決し、APIレスポンスへ `season` を含める
- リーダーボードを `voidrush_match_events` のシーズン集計へ変更
- 不正検知ルール（通貨急増 / スコア急増 / 異常マッチ値）を導入し `voidrush_anomaly_events` に記録
- `VOIDRUSH_ANALYTICS`（Analytics Engine）へ進行イベントを送信

## Phase 6（完了）

- 運用APIを追加（`/api/voidrush/ops/*`）
- 日次ロールアップ実行 API（`/ops/daily-rollup`）
- 不正ログ参照 API（`/ops/anomalies`）
- 日次ロールアップ参照 API（`/ops/rollups`）
- シーズン切替 + 前シーズンアーカイブ API（`/ops/season-rollover`）

## Phase 7（進行中）

- GitHub Actions で `/ops/daily-rollup` 日次実行（`/.github/workflows/voidrush-daily-rollup.yml`）
- 残タスク:
  - Cloudflare Worker Cron への移行（必要なら）
  - 異常検知の閾値をルールテーブル化してダッシュボード調整可能にする
  - `creator` 画面に season history / archive leaderboard を表示
