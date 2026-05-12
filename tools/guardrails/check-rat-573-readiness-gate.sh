#!/usr/bin/env bash
set -euo pipefail

ROOT_DIR="$(cd "$(dirname "${BASH_SOURCE[0]}")/../.." && pwd)"
cd "$ROOT_DIR"

echo "RAT-573 readiness gate"
echo "repo: $ROOT_DIR"

PRODUCT_BRIEF_PATH="PRODUCT_BRIEF.md"
DEPLOY_CONFIG_PATH="DEPLOY_CONFIG.md"

has_product_brief="no"
has_deploy_config="no"

if [[ -f "$PRODUCT_BRIEF_PATH" ]]; then
  has_product_brief="yes"
fi

if [[ -f "$DEPLOY_CONFIG_PATH" ]]; then
  has_deploy_config="yes"
fi

control_plane_hits="$(rg -n "\/api\/issues|activeRunId|executionRunId" server/src server/tests server/scripts 2>/dev/null || true)"

printf 'gate_product_brief=%s\n' "$has_product_brief"
printf 'gate_deploy_config=%s\n' "$has_deploy_config"

if [[ "$has_product_brief" != "yes" ]]; then
  echo "RESULT=BLOCKED_MISSING_PRODUCT_BRIEF"
  echo "DETAIL=Product brief is required before infrastructure resource allocation"
  exit 2
fi

if [[ "$has_deploy_config" != "yes" ]]; then
  echo "RESULT=BLOCKED_MISSING_DEPLOY_CONFIG"
  echo "DETAIL=DEPLOY_CONFIG.md not found in current workspace"
  exit 3
fi

if [[ -z "$control_plane_hits" ]]; then
  echo "RESULT=BLOCKED_WRONG_REPO"
  echo "DETAIL=No control-plane issue lifecycle runtime surface found"
  exit 4
fi

echo "RESULT=READY_FOR_IMPLEMENTATION"
echo "CONTROL_PLANE_SURFACE_HITS:"
printf '%s\n' "$control_plane_hits"
