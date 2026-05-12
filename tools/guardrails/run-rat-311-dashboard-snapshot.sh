#!/usr/bin/env bash
set -euo pipefail

# RAT-311 operational snapshot runner
# Outputs:
# - CSV with the latest 14 days of rat-311 dashboard rows
# - Short markdown summary for issue-thread evidence

ROOT_DIR="$(cd "$(dirname "$0")/../.." && pwd)"
SQL_FILE="$ROOT_DIR/analysis/sql/rat-311-rollout-gates-risk-dashboard.sql"
OUT_DIR="${RAT311_OUT_DIR:-$ROOT_DIR/docs/analysis}"
STAMP="$(date +%F)"
CSV_OUT="$OUT_DIR/rat-311-dashboard-snapshot-${STAMP}.csv"
MD_OUT="$OUT_DIR/rat-311-dashboard-snapshot-${STAMP}.md"

if [[ ! -f "$SQL_FILE" ]]; then
  echo "RAT_311_SNAPSHOT_FAIL:missing_sql_file:$SQL_FILE"
  exit 2
fi

if ! command -v psql >/dev/null 2>&1; then
  echo "RAT_311_SNAPSHOT_FAIL:psql_missing"
  exit 2
fi

if [[ -z "${DATABASE_URL:-}" ]]; then
  required=(PGHOST PGPORT PGDATABASE PGUSER PGPASSWORD)
  missing=()
  for key in "${required[@]}"; do
    if [[ -z "${!key:-}" ]]; then
      missing+=("$key")
    fi
  done
  if (( ${#missing[@]} > 0 )); then
    echo "RAT_311_SNAPSHOT_FAIL:missing_warehouse_creds:${missing[*]}"
    exit 2
  fi
fi

mkdir -p "$OUT_DIR"

psql -v ON_ERROR_STOP=1 -c "\\copy (
  with dashboard as (
    $(cat "$SQL_FILE")
  )
  select *
  from dashboard
  order by metric_date desc
  limit 14
) to '$CSV_OUT' with csv header"

latest_row="$(psql -v ON_ERROR_STOP=1 -Atqc "
  with dashboard as (
    $(cat "$SQL_FILE")
  )
  select
    metric_date::text || '|' ||
    coalesce(escalation_level, 'none') || '|' ||
    round(conversion_delta_rel::numeric, 4)::text || '|' ||
    round(churn_delta_rel::numeric, 4)::text || '|' ||
    round(claims_delta_rel::numeric, 4)::text || '|' ||
    round(refunds_delta_rel::numeric, 4)::text
  from dashboard
  order by metric_date desc
  limit 1;")"

IFS='|' read -r metric_date escalation conversion_delta churn_delta claims_delta refunds_delta <<< "$latest_row"

cat > "$MD_OUT" <<EOF
# RAT-311 snapshot ${STAMP}

- Source SQL: analysis/sql/rat-311-rollout-gates-risk-dashboard.sql
- CSV output: $(basename "$CSV_OUT")

## Último corte

- metric_date: ${metric_date:-N/A}
- escalation_level: ${escalation:-N/A}
- conversion_delta_rel: ${conversion_delta:-N/A}
- churn_delta_rel: ${churn_delta:-N/A}
- claims_delta_rel: ${claims_delta:-N/A}
- refunds_delta_rel: ${refunds_delta:-N/A}

## Gate operativo

- Si `escalation_level=board`, congelar expansión y escalar inmediatamente.
- Si `escalation_level=cto`, mantener fase y abrir RCA en <4h.
- Si `escalation_level=none`, continuar rollout por plan.
EOF

echo "RAT_311_SNAPSHOT_READY"
echo "CSV:$CSV_OUT"
echo "MD:$MD_OUT"
