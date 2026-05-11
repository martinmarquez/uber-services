#!/usr/bin/env bash
set -euo pipefail

ROOT_DIR="$(cd "$(dirname "${BASH_SOURCE[0]}")/../.." && pwd)"
cd "$ROOT_DIR"

cleanup() {
  if [[ -n "${API_PID:-}" ]] && kill -0 "$API_PID" 2>/dev/null; then
    kill "$API_PID" 2>/dev/null || true
  fi
}
trap cleanup EXIT INT TERM

npm run -s db:migrate:sqlite >/dev/null
npm run -s server:start &
API_PID=$!

# Wait until API is reachable on the proxy target before starting Vite.
for _ in {1..40}; do
  if curl -sf "http://127.0.0.1:5178/api/v1/providers/discovery?category=electrician&city=Buenos%20Aires&limit=1" >/dev/null; then
    break
  fi
  sleep 0.25
done

if ! curl -sf "http://127.0.0.1:5178/api/v1/providers/discovery?category=electrician&city=Buenos%20Aires&limit=1" >/dev/null; then
  echo "backend_failed_to_start: could not reach http://127.0.0.1:5178" >&2
  exit 1
fi

npm run dev
