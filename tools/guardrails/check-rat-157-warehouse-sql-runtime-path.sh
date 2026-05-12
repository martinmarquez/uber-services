#!/usr/bin/env bash
set -euo pipefail

# Guardrail for RAT-301 / RAT-157:
# require a compatible SQL client/runtime path before warehouse execution.
# Decision contract:
# - exit 0 + RAT_157_WAREHOUSE_SQL_RUNTIME_PATH_READY
# - exit 2 + RAT_157_WAREHOUSE_SQL_RUNTIME_PATH_MISSING:<reason>

if [[ -n "${AGENT_HOME:-}" ]] && [[ -f "${AGENT_HOME}/.db-env" ]]; then
  set -a
  # shellcheck disable=SC1090
  source "${AGENT_HOME}/.db-env"
  set +a
fi

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

if ! command -v psql >/dev/null 2>&1 && ! resolve_psql >/dev/null 2>&1; then
  echo "RAT_157_WAREHOUSE_SQL_RUNTIME_PATH_MISSING:psql_client"
  exit 2
fi

psql_bin="$(resolve_psql || true)"
if [[ -z "$psql_bin" ]]; then
  echo "RAT_157_WAREHOUSE_SQL_RUNTIME_PATH_MISSING:psql_client"
  exit 2
fi

has_database_url=0
has_pg_tuple=0

if [[ -n "${DATABASE_URL:-}" ]]; then
  has_database_url=1
fi

if [[ -n "${PGHOST:-}" ]] && [[ -n "${PGPORT:-}" ]] && [[ -n "${PGDATABASE:-}" ]] && [[ -n "${PGUSER:-}" ]] && [[ -n "${PGPASSWORD:-}" ]]; then
  has_pg_tuple=1
fi

if [[ "$has_database_url" -ne 1 && "$has_pg_tuple" -ne 1 ]]; then
  echo "RAT_157_WAREHOUSE_SQL_RUNTIME_PATH_MISSING:warehouse_creds"
  exit 2
fi

# Non-interactive probe guarantees the runtime can execute SQL now, not just hold env vars.
if ! "$psql_bin" -v ON_ERROR_STOP=1 -Atqc "select 1;" </dev/null >/dev/null 2>&1; then
  echo "RAT_157_WAREHOUSE_SQL_RUNTIME_PATH_MISSING:connectivity"
  exit 2
fi

surface_probe="$(
  "$psql_bin" -v ON_ERROR_STOP=1 -Atqc "select (to_regclass('public.events') is not null)::int, (to_regclass('public.support_tickets') is not null)::int;" </dev/null 2>/dev/null || true
)"

if [[ "$surface_probe" != "1|1" ]]; then
  echo "RAT_157_WAREHOUSE_SQL_RUNTIME_PATH_MISSING:rat39_source_surface"
  exit 2
fi

echo "RAT_157_WAREHOUSE_SQL_RUNTIME_PATH_READY"
exit 0
