#!/usr/bin/env bash
set -euo pipefail

# RAT-301 acceptance gate:
# 1) psql client executable
# 2) non-interactive query succeeds
#
# Exit contract:
# - 0: RAT_301_ACCEPTANCE_PASS
# - 2: RAT_301_ACCEPTANCE_FAIL:<reason>

load_runtime_env() {
  if [[ -n "${AGENT_HOME:-}" ]] && [[ -f "${AGENT_HOME}/.db-env" ]]; then
    set -a
    # shellcheck disable=SC1090
    source "${AGENT_HOME}/.db-env"
    set +a
  fi
}

resolve_psql() {
  local candidate=""
  local -a candidates=()

  if command -v psql >/dev/null 2>&1; then
    candidates+=("$(command -v psql)")
  fi

  if [[ -n "${AGENT_HOME:-}" ]]; then
    candidates+=("${AGENT_HOME}/.micromamba/root/envs/pgclient/bin/psql")
  fi

  candidates+=("/opt/homebrew/bin/psql" "/usr/local/bin/psql" "/usr/bin/psql")

  for candidate in "${candidates[@]}"; do
    if [[ -x "$candidate" ]] && "$candidate" --version >/dev/null 2>&1; then
      printf '%s\n' "$candidate"
      return 0
    fi
  done

  return 1
}

load_runtime_env

if ! command -v psql >/dev/null 2>&1 && ! resolve_psql >/dev/null 2>&1; then
  echo "RAT_301_ACCEPTANCE_FAIL:psql_missing"
  exit 2
fi

psql_bin="$(resolve_psql || true)"
if [[ -z "$psql_bin" ]]; then
  echo "RAT_301_ACCEPTANCE_FAIL:psql_unexecutable"
  exit 2
fi

if [[ -z "${DATABASE_URL:-}" ]] && { [[ -z "${PGHOST:-}" ]] || [[ -z "${PGPORT:-}" ]] || [[ -z "${PGDATABASE:-}" ]] || [[ -z "${PGUSER:-}" ]] || [[ -z "${PGPASSWORD:-}" ]]; }; then
  echo "RAT_301_ACCEPTANCE_FAIL:warehouse_creds_missing"
  exit 2
fi

if ! "$psql_bin" -Atqc "select now();" </dev/null >/dev/null 2>&1; then
  echo "RAT_301_ACCEPTANCE_FAIL:warehouse_connectivity"
  exit 2
fi

echo "RAT_301_ACCEPTANCE_PASS"
exit 0
