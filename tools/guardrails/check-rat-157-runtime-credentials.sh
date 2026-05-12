#!/usr/bin/env bash
set -euo pipefail

# Guardrail for RAT-157: block unblock attempts while runtime warehouse/BI creds are absent.

if [[ -n "${AGENT_HOME:-}" ]] && [[ -f "${AGENT_HOME}/.db-env" ]]; then
  set -a
  # shellcheck disable=SC1090
  source "${AGENT_HOME}/.db-env"
  set +a
fi

has_warehouse_creds=0
has_bi_creds=0

if [[ -n "${DATABASE_URL:-}" ]] || {
  [[ -n "${PGHOST:-}" ]] && [[ -n "${PGPORT:-}" ]] && [[ -n "${PGDATABASE:-}" ]] && [[ -n "${PGUSER:-}" ]] && [[ -n "${PGPASSWORD:-}" ]]
}; then
  has_warehouse_creds=1
fi

for key in BI_TOKEN BI_URL BI_API_KEY LOOKER_BASE_URL LOOKER_CLIENT_ID LOOKER_CLIENT_SECRET METABASE_URL METABASE_API_KEY SUPERSET_URL SUPERSET_API_KEY; do
  if [[ -n "${!key:-}" ]]; then
    has_bi_creds=1
    break
  fi
done

if [[ "$has_warehouse_creds" -eq 1 && "$has_bi_creds" -eq 1 ]]; then
  echo "RAT_157_RUNTIME_CREDS_READY"
  exit 0
fi

missing=()
if [[ "$has_warehouse_creds" -ne 1 ]]; then
  missing+=("warehouse")
fi
if [[ "$has_bi_creds" -ne 1 ]]; then
  missing+=("bi")
fi

printf 'RAT_157_RUNTIME_CREDS_MISSING:%s\n' "$(IFS=,; echo "${missing[*]}")"
exit 2
