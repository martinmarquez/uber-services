#!/usr/bin/env bash
set -euo pipefail

# Guardrail for RAT-191: do not auto-unblock without executable warehouse credential evidence.
# Evidence contract:
# - READY requires both markers:
#   1) RAT_191_RUNTIME_WAREHOUSE_CREDS_READY
#   2) RAT_191_RUNTIME_WAREHOUSE_CREDS_EVIDENCE:<database_url|pg_tuple>
# - MISSING returns:
#   RAT_191_RUNTIME_WAREHOUSE_CREDS_MISSING

has_database_url=0
has_pg_tuple=0

if [[ -n "${DATABASE_URL:-}" ]]; then
  has_database_url=1
fi

if [[ -n "${PGHOST:-}" ]] && [[ -n "${PGPORT:-}" ]] && [[ -n "${PGDATABASE:-}" ]] && [[ -n "${PGUSER:-}" ]] && [[ -n "${PGPASSWORD:-}" ]]; then
  has_pg_tuple=1
fi

if [[ "$has_database_url" -eq 1 || "$has_pg_tuple" -eq 1 ]]; then
  echo "RAT_191_RUNTIME_WAREHOUSE_CREDS_READY"
  if [[ "$has_database_url" -eq 1 ]]; then
    echo "RAT_191_RUNTIME_WAREHOUSE_CREDS_EVIDENCE:database_url"
  else
    echo "RAT_191_RUNTIME_WAREHOUSE_CREDS_EVIDENCE:pg_tuple"
  fi
  exit 0
fi

echo "RAT_191_RUNTIME_WAREHOUSE_CREDS_MISSING"
exit 2
