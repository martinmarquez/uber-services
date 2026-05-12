#!/usr/bin/env bash
set -euo pipefail

# Guardrail for RAT-290: do not auto-unblock without executable warehouse credential evidence.
# RAT-290 inherits the runtime credential gate from RAT-191.

has_database_url=0
has_pg_tuple=0

if [[ -n "${DATABASE_URL:-}" ]]; then
  has_database_url=1
fi

if [[ -n "${PGHOST:-}" ]] && [[ -n "${PGPORT:-}" ]] && [[ -n "${PGDATABASE:-}" ]] && [[ -n "${PGUSER:-}" ]] && [[ -n "${PGPASSWORD:-}" ]]; then
  has_pg_tuple=1
fi

if [[ "$has_database_url" -eq 1 || "$has_pg_tuple" -eq 1 ]]; then
  echo "RAT_290_RUNTIME_WAREHOUSE_CREDS_READY"
  exit 0
fi

echo "RAT_290_RUNTIME_WAREHOUSE_CREDS_MISSING"
exit 2
