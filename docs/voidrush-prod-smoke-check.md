# VOIDRUSH Production Smoke Check

## 1. Auth bootstrap (200 expected)

```bash
PLAYER_ID="player_$(uuidgen | tr '[:upper:]' '[:lower:]')"
SESSION_ID="session_$(uuidgen | tr '[:upper:]' '[:lower:]')"
PROOF_ID="proof_$(uuidgen | tr '[:upper:]' '[:lower:]')"

curl -sS -X POST 'https://ai-yu-me.com/api/voidrush/progression/auth/bootstrap' \
  -H 'content-type: application/json' \
  -H "x-player-id: ${PLAYER_ID}" \
  -H "x-session-id: ${SESSION_ID}" \
  -H "x-voidrush-proof: ${PROOF_ID}" \
  --data '{"payload":{"reason":"smoke_check"}}'
```

## 2. Snapshot without token (401 expected)

```bash
curl -i -sS 'https://ai-yu-me.com/api/voidrush/progression/snapshot' \
  -H "x-player-id: ${PLAYER_ID}" \
  -H "x-session-id: ${SESSION_ID}"
```

## 3. Snapshot with token (200 expected)

```bash
TOKEN='<bootstrap response token>'

curl -i -sS 'https://ai-yu-me.com/api/voidrush/progression/snapshot' \
  -H "authorization: Bearer ${TOKEN}" \
  -H "x-player-id: ${PLAYER_ID}" \
  -H "x-session-id: ${SESSION_ID}"
```

## 4. Leaderboard anonymization

```bash
curl -sS 'https://ai-yu-me.com/api/voidrush/progression/leaderboard?limit=5'
```

Expected:
- `rows[].playerId` is `pilot_...`
- no `player_...` raw identifier in leaderboard response
