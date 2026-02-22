#!/usr/bin/env bash
set -euo pipefail

SCRIPT_DIR="$(cd "$(dirname "${BASH_SOURCE[0]}")" && pwd)"
REPO_ROOT="$(cd "${SCRIPT_DIR}/.." && pwd)"
SMOKE_SCRIPT="${SCRIPT_DIR}/voidrush_prod_smoke.sh"

BASE_URL="https://ai-yu-me.com/api/voidrush"
HOURS=24
INTERVAL_SEC=300
OUT_DIR="${REPO_ROOT}/logs/voidrush-monitor"

COMMAND="start"
if [[ $# -gt 0 ]]; then
  case "$1" in
    start|status|stop)
      COMMAND="$1"
      shift
      ;;
  esac
fi

while [[ $# -gt 0 ]]; do
  case "$1" in
    --base-url)
      BASE_URL="${2:?--base-url requires a value}"
      shift 2
      ;;
    --hours)
      HOURS="${2:?--hours requires a value}"
      shift 2
      ;;
    --interval-sec)
      INTERVAL_SEC="${2:?--interval-sec requires a value}"
      shift 2
      ;;
    --out-dir)
      OUT_DIR="${2:?--out-dir requires a value}"
      shift 2
      ;;
    *)
      echo "[ERROR] unknown option: $1" >&2
      exit 1
      ;;
  esac
done

mkdir -p "${OUT_DIR}"
PID_FILE="${OUT_DIR}/monitor.pid"
LATEST_FILE="${OUT_DIR}/latest-run.txt"

monitor_status() {
  if [[ ! -f "${PID_FILE}" ]]; then
    echo "[INFO] monitor is not running (pid file not found: ${PID_FILE})"
    return 1
  fi

  local pid
  pid="$(cat "${PID_FILE}")"
  if [[ -n "${pid}" ]] && kill -0 "${pid}" 2>/dev/null; then
    echo "[INFO] monitor is running (pid=${pid})"
    if [[ -f "${LATEST_FILE}" ]]; then
      cat "${LATEST_FILE}"
    fi
    return 0
  fi

  echo "[WARN] stale pid file found (pid=${pid}); monitor is not running"
  return 1
}

monitor_stop() {
  if [[ ! -f "${PID_FILE}" ]]; then
    echo "[INFO] monitor is not running"
    return 0
  fi

  local pid
  pid="$(cat "${PID_FILE}")"
  if [[ -n "${pid}" ]] && kill -0 "${pid}" 2>/dev/null; then
    kill "${pid}"
    echo "[INFO] sent TERM to pid=${pid}"
  else
    echo "[WARN] pid=${pid} was not running"
  fi

  rm -f "${PID_FILE}"
  return 0
}

case "${COMMAND}" in
  status)
    monitor_status
    exit $?
    ;;
  stop)
    monitor_stop
    exit $?
    ;;
  start)
    ;;
  *)
    echo "[ERROR] unsupported command: ${COMMAND}" >&2
    exit 1
    ;;
esac

if [[ ! -x "${SMOKE_SCRIPT}" ]]; then
  echo "[ERROR] smoke script not executable: ${SMOKE_SCRIPT}" >&2
  exit 1
fi

if [[ -f "${PID_FILE}" ]]; then
  existing_pid="$(cat "${PID_FILE}")"
  if [[ -n "${existing_pid}" ]] && kill -0 "${existing_pid}" 2>/dev/null; then
    echo "[ERROR] monitor already running (pid=${existing_pid})"
    exit 1
  fi
fi

RUN_ID="$(date -u +%Y%m%dT%H%M%SZ)"
LOG_FILE="${OUT_DIR}/monitor-${RUN_ID}.log"
SUMMARY_FILE="${OUT_DIR}/monitor-${RUN_ID}.summary"

START_EPOCH="$(date +%s)"
END_EPOCH=$((START_EPOCH + HOURS * 3600))
START_UTC="$(date -u +%Y-%m-%dT%H:%M:%SZ)"
EXPECTED_END_UTC="$(date -u -r "${END_EPOCH}" +%Y-%m-%dT%H:%M:%SZ)"

echo "$$" > "${PID_FILE}"
{
  echo "run_id=${RUN_ID}"
  echo "pid=$$"
  echo "started_utc=${START_UTC}"
  echo "expected_end_utc=${EXPECTED_END_UTC}"
  echo "base_url=${BASE_URL}"
  echo "hours=${HOURS}"
  echo "interval_sec=${INTERVAL_SEC}"
  echo "log_file=${LOG_FILE}"
} > "${LATEST_FILE}"

cleanup() {
  rm -f "${PID_FILE}"
}
trap cleanup EXIT INT TERM

iteration=0
pass_count=0
fail_count=0

echo "[INFO] monitor started run_id=${RUN_ID} pid=$$ base_url=${BASE_URL}" | tee -a "${LOG_FILE}"
echo "[INFO] expected end at ${EXPECTED_END_UTC}" | tee -a "${LOG_FILE}"

while (( "$(date +%s)" < END_EPOCH )); do
  iteration=$((iteration + 1))
  ts="$(date -u +%Y-%m-%dT%H:%M:%SZ)"
  echo "[${ts}] iteration=${iteration} start" | tee -a "${LOG_FILE}"

  if "${SMOKE_SCRIPT}" "${BASE_URL}" >> "${LOG_FILE}" 2>&1; then
    pass_count=$((pass_count + 1))
    echo "[${ts}] iteration=${iteration} result=PASS" | tee -a "${LOG_FILE}"
  else
    rc=$?
    fail_count=$((fail_count + 1))
    echo "[${ts}] iteration=${iteration} result=FAIL exit=${rc}" | tee -a "${LOG_FILE}"
  fi

  now_epoch="$(date +%s)"
  if (( now_epoch >= END_EPOCH )); then
    break
  fi

  sleep_sec="${INTERVAL_SEC}"
  remaining_sec=$((END_EPOCH - now_epoch))
  if (( remaining_sec < INTERVAL_SEC )); then
    sleep_sec="${remaining_sec}"
  fi
  echo "[INFO] sleeping ${sleep_sec}s" | tee -a "${LOG_FILE}"
  sleep "${sleep_sec}"
done

FINISHED_UTC="$(date -u +%Y-%m-%dT%H:%M:%SZ)"
{
  echo "run_id=${RUN_ID}"
  echo "started_utc=${START_UTC}"
  echo "finished_utc=${FINISHED_UTC}"
  echo "base_url=${BASE_URL}"
  echo "hours=${HOURS}"
  echo "interval_sec=${INTERVAL_SEC}"
  echo "iterations=${iteration}"
  echo "passes=${pass_count}"
  echo "failures=${fail_count}"
  echo "log_file=${LOG_FILE}"
} | tee "${SUMMARY_FILE}"

if (( fail_count > 0 )); then
  echo "[ERROR] monitor completed with failures=${fail_count}" | tee -a "${LOG_FILE}"
  exit 1
fi

echo "[INFO] monitor completed with all checks passing" | tee -a "${LOG_FILE}"
