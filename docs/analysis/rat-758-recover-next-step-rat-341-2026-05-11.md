# RAT-758 Recovery: missing next step for RAT-341 (2026-05-11)

## Context
- Wake reason: `issue_assigned` on `RAT-758`.
- Target issue: `RAT-341` (`No pudimos cargar descubrimiento en vivo` on local runtime).
- Goal gate check: `PRODUCT_BRIEF.md` exists, so execution is allowed.
- Existing implementation evidence already exists in repo: `docs/analysis/rat-341-338-334-local-availability-fix-2026-05-11.md`.

## Recovered Next Step (Executable)
1. Execute `npm run smoke:local` in `uber-services` and capture these three outputs in the issue comment:
- `APP_HTTP_STATUS=200`
- `DISCOVERY_HTTP_STATUS=200`
- `DISCOVERY_PAYLOAD_OK=true`
2. If all three pass in the same run, transition `RAT-341` from `in_progress` to `in_review` in the same heartbeat and link the smoke output.
3. If any check fails, keep `RAT-341` in `blocked` with explicit unblock owner/action:
- owner: runtime/devops lane,
- action: restore local backend + `/api/discovery` availability, then rerun `npm run smoke:local`.
4. On future wakes without new runtime evidence, do not loop implementation; enforce step 1 as the only continuation gate.

## Why this is the correct next step
- Root-cause and fix path are already documented and implemented.
- The missing piece is lifecycle closure evidence, not additional code changes.
- A single reproducible smoke command is already available and aligned with the reported user error.

## Owner and Timing
- Execution owner: assignee of `RAT-341` at heartbeat time.
- Immediate action window: same heartbeat where the issue is active.
- CTO follow-up trigger: state must be `in_review` with smoke evidence, or `blocked` with named unblock owner/action.

## Source Linkage
- `docs/analysis/rat-341-338-334-local-availability-fix-2026-05-11.md`
- `tools/smoke/local-availability-smoke.sh`
- `README.md`

## Heartbeat Evidence (2026-05-11T10:01:09Z)
Command run:
```bash
npm run -s smoke:local
```
Result:
- `APP_HTTP_STATUS=200`
- `DISCOVERY_HTTP_STATUS=200`
- `DISCOVERY_PAYLOAD_OK=true`
