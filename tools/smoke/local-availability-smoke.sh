#!/usr/bin/env bash
set -euo pipefail

ROOT_DIR="$(cd "$(dirname "$0")/../.." && pwd)"
cd "$ROOT_DIR"

BACK_LOG="/tmp/rat_local_backend.log"
FRONT_LOG="/tmp/rat_local_frontend.log"

npm run -s server:start >"$BACK_LOG" 2>&1 &
BACK_PID=$!

npm run -s dev >"$FRONT_LOG" 2>&1 &
FRONT_PID=$!

cleanup() {
  kill "$BACK_PID" >/dev/null 2>&1 || true
  kill "$FRONT_PID" >/dev/null 2>&1 || true
}
trap cleanup EXIT

sleep 3

HTTP_APP="$(curl -s -o /tmp/rat_home.html -w "%{http_code}" http://127.0.0.1:5173/)"
HTTP_DISCOVERY="$(curl -s -o /tmp/rat_discovery.json -w "%{http_code}" "http://127.0.0.1:5173/api/v1/providers/discovery?category=cleaning&city=Buenos%20Aires&limit=3")"

if [[ "$HTTP_APP" != "200" ]]; then
  echo "APP_HTTP_STATUS=$HTTP_APP"
  echo "--- frontend log ---"
  cat "$FRONT_LOG"
  exit 1
fi

if [[ "$HTTP_DISCOVERY" != "200" ]]; then
  echo "DISCOVERY_HTTP_STATUS=$HTTP_DISCOVERY"
  echo "--- backend log ---"
  cat "$BACK_LOG"
  echo "--- frontend log ---"
  cat "$FRONT_LOG"
  exit 1
fi

if ! rg -q '"ok":true' /tmp/rat_discovery.json; then
  echo "DISCOVERY_PAYLOAD_INVALID"
  cat /tmp/rat_discovery.json
  exit 1
fi

echo "APP_HTTP_STATUS=$HTTP_APP"
echo "DISCOVERY_HTTP_STATUS=$HTTP_DISCOVERY"
echo "DISCOVERY_PAYLOAD_OK=true"
