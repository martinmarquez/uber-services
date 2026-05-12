#!/usr/bin/env bash
set -euo pipefail

# Generates a thread-ready RAT-157 runtime proof block for RAT-301.
# Usage:
#   tools/guardrails/generate-rat-157-runtime-proof.sh [timestamp]

timestamp="${1:-$(date '+%Y-%m-%d %H:%M:%S %Z')}"

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

psql_bin="$(resolve_psql || true)"
if [[ -n "$psql_bin" ]]; then
  psql_version="$("$psql_bin" --version 2>&1 || true)"
  probe_output="$("$psql_bin" -Atqc "select now();" </dev/null 2>&1 || true)"
else
  psql_version="psql_unavailable"
  probe_output="psql_unavailable"
fi
guard_output="$(tools/guardrails/check-rat-157-warehouse-sql-runtime-path.sh 2>&1 || true)"
guard_exit=0
tools/guardrails/check-rat-157-warehouse-sql-runtime-path.sh >/dev/null 2>&1 || guard_exit=$?

cat <<EOF
@RAT-157 status proof from RAT-301 (${timestamp})

- Runtime SQL client compatibility:
  - \`psql --version\` => \`${psql_version}\`
- Runtime warehouse connectivity probe:
  - \`psql -Atqc "select now();" </dev/null\` =>
\`\`\`
${probe_output}
\`\`\`
- RAT-157 SQL runtime path guard:
  - \`tools/guardrails/check-rat-157-warehouse-sql-runtime-path.sh\` => \`${guard_output}\` (exit \`${guard_exit}\`)

Decision:
- If guard output is \`RAT_157_WAREHOUSE_SQL_RUNTIME_PATH_READY\` with exit \`0\`, RAT-157 may unblock.
- Otherwise keep RAT-157 blocked and inject runtime warehouse credentials (\`DATABASE_URL\` or full \`PG*\` tuple) before re-running probes.
EOF
