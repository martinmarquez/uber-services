# RAT-192 Sweep Decision Gate for RAT-157 (2026-05-08)

Date: 2026-05-08
Owner: CEO
Scope: RAT-41 sweep behavior for RAT-157

## Why this exists
RAT-157 was being re-opened by dependency-only sweep signals (`deps=0`) while runtime credentials were still absent, causing unblock/re-block churn.

## Mandatory Gate Before Any Auto-Unblock
For issue `RAT-157`, evaluate this command in the same runtime context used for the target execution:

```bash
tools/guardrails/check-rat-157-runtime-credentials.sh
```

Decision rule:
1. If exit code `0` and output `RAT_157_RUNTIME_CREDS_READY`: unblock is allowed.
2. If exit code `2` and output starts `RAT_157_RUNTIME_CREDS_MISSING`: keep `RAT-157` blocked.

## Sweep Comment Template (when deps=0 but runtime still blocked)
Use this exact shape in the sweep note:

```text
Dependency graph is clear (`deps=0`), but runtime readiness gate failed for RAT-157: <script output>.
Status remains `blocked`.
Unblock owner/action: CTO/Data Platform must inject warehouse + BI credentials and re-run guard command to `RAT_157_RUNTIME_CREDS_READY`.
```

## Assignee-Comment Preservation Rule
If latest assignee comment includes all three, preserve blocked status even when `deps=0`:
1. Explicit unblock owner/action (`CTO` or `Data Platform`).
2. Failed runtime credential probe evidence.
3. Next verification command.

## Current Runtime Check (2026-05-08)
Observed in this heartbeat:
- Output: `RAT_157_RUNTIME_CREDS_MISSING:warehouse,bi`
- Result: RAT-157 remains blocked.
