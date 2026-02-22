#!/usr/bin/env bash
set -euo pipefail

BASE_URL="${1:-https://ai-yu-me.com/api/voidrush}"

pass() { echo "PASS: $1"; }
fail() { echo "FAIL: $1"; exit 1; }

echo "[INFO] BASE_URL=${BASE_URL}"

PLAYER_ID="player_$(uuidgen | tr '[:upper:]' '[:lower:]')"
SESSION_ID="session_$(uuidgen | tr '[:upper:]' '[:lower:]')"
PROOF_ID="proof_$(uuidgen | tr '[:upper:]' '[:lower:]')"

BOOTSTRAP_RESP="$(curl -sS -X POST "${BASE_URL}/progression/auth/bootstrap" \
  -H 'content-type: application/json' \
  -H "x-player-id: ${PLAYER_ID}" \
  -H "x-session-id: ${SESSION_ID}" \
  -H "x-voidrush-proof: ${PROOF_ID}" \
  --data '{"payload":{"reason":"script_smoke"}}')"

BOOTSTRAP_OK="$(printf '%s' "$BOOTSTRAP_RESP" | node -e "let s='';process.stdin.on('data',d=>s+=d).on('end',()=>{const j=JSON.parse(s);process.stdout.write(String(Boolean(j.ok && j.token)));})")"
TOKEN="$(printf '%s' "$BOOTSTRAP_RESP" | node -e "let s='';process.stdin.on('data',d=>s+=d).on('end',()=>{const j=JSON.parse(s);process.stdout.write(j.token||'');})")"

if [[ "$BOOTSTRAP_OK" == "true" ]]; then
  pass "bootstrap returns token"
else
  echo "$BOOTSTRAP_RESP"
  fail "bootstrap failed"
fi

TIME_GET_CODE="$(curl -sS -o /tmp/vr_time_get.json -w '%{http_code}' "${BASE_URL}/time")"
[[ "$TIME_GET_CODE" == "200" ]] && pass "GET /time returns 200" || fail "GET /time expected 200, got ${TIME_GET_CODE}"

SEASON_GET_CODE="$(curl -sS -o /tmp/vr_season_get.json -w '%{http_code}' "${BASE_URL}/progression/season")"
[[ "$SEASON_GET_CODE" == "200" ]] && pass "GET /progression/season returns 200" || fail "GET /progression/season expected 200, got ${SEASON_GET_CODE}"

TIME_HEAD_CODE="$(curl -sS -o /tmp/vr_time_head.txt -w '%{http_code}' -I "${BASE_URL}/time")"
[[ "$TIME_HEAD_CODE" == "200" ]] && pass "HEAD /time returns 200" || fail "HEAD /time expected 200, got ${TIME_HEAD_CODE}"

SEASON_HEAD_CODE="$(curl -sS -o /tmp/vr_season_head.txt -w '%{http_code}' -I "${BASE_URL}/progression/season")"
[[ "$SEASON_HEAD_CODE" == "200" ]] && pass "HEAD /progression/season returns 200" || fail "HEAD /progression/season expected 200, got ${SEASON_HEAD_CODE}"

NOAUTH_CODE="$(curl -sS -o /tmp/vr_snapshot_noauth.json -w '%{http_code}' "${BASE_URL}/progression/snapshot")"
[[ "$NOAUTH_CODE" == "401" ]] && pass "snapshot without token is 401" || fail "snapshot without token expected 401, got ${NOAUTH_CODE}"

AUTH_CODE="$(curl -sS -o /tmp/vr_snapshot_auth.json -w '%{http_code}' "${BASE_URL}/progression/snapshot" \
  -H "authorization: Bearer ${TOKEN}" \
  -H "x-player-id: ${PLAYER_ID}" \
  -H "x-session-id: ${SESSION_ID}")"
[[ "$AUTH_CODE" == "200" ]] && pass "snapshot with token is 200" || fail "snapshot with token expected 200, got ${AUTH_CODE}"

MISMATCH_CODE="$(curl -sS -o /tmp/vr_snapshot_mismatch.json -w '%{http_code}' "${BASE_URL}/progression/snapshot" \
  -H "authorization: Bearer ${TOKEN}" \
  -H "x-player-id: player_mismatch_test" \
  -H "x-session-id: ${SESSION_ID}")"
[[ "$MISMATCH_CODE" == "401" ]] && pass "mismatch player header returns 401" || fail "mismatch header expected 401, got ${MISMATCH_CODE}"

LB_RESP="$(curl -sS "${BASE_URL}/progression/leaderboard?limit=5")"
HAS_PILOT="$(printf '%s' "$LB_RESP" | node -e "let s='';process.stdin.on('data',d=>s+=d).on('end',()=>{const j=JSON.parse(s);const rows=Array.isArray(j.rows)?j.rows:[];const ok=rows.some(r=>/^pilot_[A-Za-z0-9]+$/.test(String(r.playerId||'')));process.stdout.write(ok?'true':'false');})")"
HAS_RAW="$(printf '%s' "$LB_RESP" | node -e "let s='';process.stdin.on('data',d=>s+=d).on('end',()=>{const j=JSON.parse(s);const rows=Array.isArray(j.rows)?j.rows:[];const hasRaw=rows.some(r=>/^player_[A-Za-z0-9._-]+$/.test(String(r.playerId||'')));process.stdout.write(hasRaw?'true':'false');})")"

if [[ "$HAS_PILOT" == "true" ]]; then
  pass "leaderboard contains pilot_*"
else
  echo "$LB_RESP"
  fail "leaderboard missing pilot_*"
fi

if [[ "$HAS_RAW" == "false" ]]; then
  pass "leaderboard does not expose raw player_*"
else
  echo "$LB_RESP"
  fail "leaderboard exposes raw player_*"
fi

CORS_CODE="$(curl -sS -o /tmp/vr_options.txt -w '%{http_code}' -X OPTIONS "${BASE_URL}/progression/snapshot" \
  -H 'Origin: https://ai-yu-me.com' \
  -H 'Access-Control-Request-Method: GET' \
  -H 'Access-Control-Request-Headers: authorization,x-player-id,x-session-id')"
[[ "$CORS_CODE" == "204" ]] && pass "OPTIONS preflight returns 204" || fail "OPTIONS expected 204, got ${CORS_CODE}"

FAVICON_ROOT_CODE="$(curl -sS -o /tmp/vr_favicon_root.bin -w '%{http_code}' 'https://ai-yu-me.com/favicon.ico')"
[[ "$FAVICON_ROOT_CODE" == "200" ]] && pass "root favicon.ico returns 200" || fail "root favicon.ico expected 200, got ${FAVICON_ROOT_CODE}"

FAVICON_APP_CODE="$(curl -sS -o /tmp/vr_favicon_app.bin -w '%{http_code}' 'https://ai-yu-me.com/creator/void-rush/favicon.svg')"
[[ "$FAVICON_APP_CODE" == "200" ]] && pass "app favicon.svg returns 200" || fail "app favicon.svg expected 200, got ${FAVICON_APP_CODE}"

echo "[INFO] VOIDRUSH production smoke checks completed"
