# VOIDRUSH Release Record (2026-02-22)

## 1. Merge Record

- `SteadyStudyWeb`:
  - branch: `codex/voidrush-auth-hardening` -> `main`
  - merge commit: `61e557e` (`merge: voidrush hardening release`)
- `NanjyoEnglishApp`:
  - branch: `codex/voidrush-api-proxy` -> `main`
  - merge commit: `d07fc1d` (`merge: voidrush api proxy routing`)

## 2. Deployment Record (Cloudflare)

### 2.1 Cloudflare Pages (Production)

- project: `aiyume-web`
  - deployment id: `1b4a4485-baf2-4d9d-890b-62dbcbe654b5`
  - source commit: `94e6296`
  - deployment URL: `https://1b4a4485.aiyume-web.pages.dev`
- project: `steady-study-web`
  - deployment id: `cd71cf56-5d82-496c-9021-149fa1e122b9`
  - source commit: `94e6296`
  - deployment URL: `https://cd71cf56.steady-study-web.pages.dev`

### 2.2 Cloudflare Worker

- service: `nanjyoenglishapp`
- latest version id: `b3789dc1-4fdf-4b68-b4e1-281dfda3d091`
- created at (UTC): `2026-02-22T07:49:30.950Z`

## 3. Validation Record

### 3.1 API/Contract Smoke (Codex)

- executed script: `scripts/voidrush_prod_smoke.sh`
- result: `PASS`
- confirmed:
  - `POST /progression/auth/bootstrap` -> `200`
  - `GET /time` -> `200`
  - `GET /progression/season` -> `200`
  - `HEAD /time` -> `200`
  - `HEAD /progression/season` -> `200`
  - `GET /progression/snapshot` (no token) -> `401`
  - `GET /progression/snapshot` (token) -> `200`
  - mismatch `x-player-id` -> `401`
  - leaderboard anonymization (`pilot_*`) -> `PASS`
  - CORS preflight (`OPTIONS /progression/snapshot`) -> `204`
  - favicon checks (`/favicon.ico`, `/creator/void-rush/favicon.svg`) -> `200`

### 3.2 E2E Regression (Antigravity Mode C / Deep)

- result: `Go (完全合格)`
- all required cases reported as success:
  - routing: `VR-ROUTE-001..004`
  - auth/sync/mutation/queue/security/assets: all pass
- regressions previously observed (`tutorial re-open`, `favicon 404`, `/time` `/season` 404) are reported as resolved.

## 4. 24h Monitoring Record

- monitor script: `scripts/voidrush_prod_monitor_24h.sh`
- smoke baseline script: `scripts/voidrush_prod_smoke.sh`
- control commands:
  - start: `./scripts/voidrush_prod_monitor_24h.sh start --hours 24 --interval-sec 300`
  - status: `./scripts/voidrush_prod_monitor_24h.sh status`
  - stop: `./scripts/voidrush_prod_monitor_24h.sh stop`
- output directory: `logs/voidrush-monitor/`

### 4.1 Active Run

- run id: `20260222T115518Z`
- pid: `44044`
- start (UTC): `2026-02-22T11:55:18Z`
- expected end (UTC): `2026-02-23T11:55:18Z`
- status at record time: `iteration=1 PASS`, running
