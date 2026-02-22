# Antigravity VOIDRUSH Test Matrix

## Precondition (All Cases)
- Browser storage clear
- Network Preserve Log ON
- Desktop + Mobile(390x844) 両方で確認（指定ケース）

## Cases

| ID | Priority | Area | Scenario | Expected |
|---|---|---|---|---|
| VR-ROUTE-001 | P1 | Routing | `GET /api/voidrush/time` | 200, JSON応答 |
| VR-ROUTE-002 | P1 | Routing | `GET /api/voidrush/progression/season` | 200 |
| VR-AUTH-001 | P1 | Auth | `POST /progression/auth/bootstrap` | 200, token発行 |
| VR-AUTH-002 | P1 | Auth | tokenなしで `GET /progression/snapshot` | 401 |
| VR-AUTH-003 | P1 | Auth | tokenありで `GET /progression/snapshot` | 200 |
| VR-AUTH-004 | P1 | Auth | token+不一致 `x-player-id` | 401 (`player_id_mismatch`) |
| VR-AUTH-005 | P2 | Auth | 破損Bearer token | 401 |
| VR-SYNC-001 | P1 | Sync | 初回起動→snapshot取得 | hasProfile false/true でも初期化失敗しない |
| VR-SYNC-002 | P2 | Sync | tutorial スキップ後にホーム再表示 | チュートリアル再表示なし |
| VR-SYNC-003 | P2 | Sync | 1戦後ホームへ戻る | tutorialDone後退なし |
| VR-MUT-001 | P1 | Progression | 1戦プレイ後 match-result送信 | 200, snapshot更新 |
| VR-MUT-002 | P2 | Progression | battlepass exp送信 | 200 |
| VR-MUT-003 | P2 | Progression | gacha pull（通常通信） | 無限リトライなし |
| VR-QUEUE-001 | P2 | Queue | オフラインで操作→オンライン復帰 | UI操作継続可能、致命停止なし |
| VR-QUEUE-002 | P2 | Queue | flush後の残件確認 | 減少または妥当な再試行 |
| VR-SEC-001 | P1 | Data Exposure | leaderboard取得 | playerId が pilot_* |
| VR-SEC-002 | P1 | Data Exposure | leaderboard body検査 | player_ / session_ が含まれない |
| VR-CORS-001 | P2 | CORS | OPTIONS preflight (`Origin: https://ai-yu-me.com`) | 204, CORSヘッダあり |
| VR-ASSET-001 | P3 | Asset | `GET /favicon.ico` | 200 |
| VR-ASSET-002 | P3 | Asset | `GET /creator/void-rush/favicon.svg` | 200 |
| VR-ASSET-003 | P3 | Asset | 初回ロードConsole | favicon 404なし |

## Output Rule
- 失敗ケースのみ Findings化
- ただし P1 は成功/失敗ともに結果を記録
- 1ケース1レコードで管理し、IDを必ず出力する
