# RAT-304 RAT-41/RAT-235 Auto-Unblock Gate via RAT-157 SQL READY (2026-05-10)

## Scope
Harden RAT-41 unblock decision path for RAT-235 so `deps=0` is insufficient.

## Implemented Guard
Added executable gate:

- `tools/guardrails/check-rat-41-rat-235-auto-unblock.sh`

Decision contract:

- `exit 0` + `RAT_41_RAT_235_AUTO_UNBLOCK_READY`
- `exit 2` + `RAT_41_RAT_235_AUTO_UNBLOCK_BLOCKED:rat39_source_surface`

Gate requirements enforced:

1. Same-thread evidence file contains marker `RAT_157_WAREHOUSE_SQL_RUNTIME_PATH_READY`.
2. Fresh runtime re-check passes by executing:
   - `tools/guardrails/check-rat-157-warehouse-sql-runtime-path.sh`
   - Requires `exit 0` + marker `RAT_157_WAREHOUSE_SQL_RUNTIME_PATH_READY`.

If either requirement fails, RAT-235 must remain blocked with reason `rat39_source_surface`.

## Usage

```bash
tools/guardrails/check-rat-41-rat-235-auto-unblock.sh <same_thread_evidence_file>
```

## Verification Snapshot

Executed locally in current runtime:

```bash
tools/guardrails/check-rat-41-rat-235-auto-unblock.sh /tmp/does-not-exist.txt
# => RAT_41_RAT_235_AUTO_UNBLOCK_BLOCKED:rat39_source_surface (exit 2)

printf 'RAT_157_WAREHOUSE_SQL_RUNTIME_PATH_READY\n' >/tmp/rat235-ready-evidence.txt
tools/guardrails/check-rat-41-rat-235-auto-unblock.sh /tmp/rat235-ready-evidence.txt
# => RAT_41_RAT_235_AUTO_UNBLOCK_BLOCKED:rat39_source_surface (exit 2, because fresh RAT-157 guard not READY in this runtime)
```

This proves non-READY path does not auto-unblock RAT-235.

## Heartbeat Evidence (2026-05-11)

Executed in this heartbeat:

```bash
tmp_evidence=$(mktemp)
echo 'no ready marker present' > "$tmp_evidence"
tools/guardrails/check-rat-41-rat-235-auto-unblock.sh "$tmp_evidence"
# => RAT_41_RAT_235_AUTO_UNBLOCK_BLOCKED:rat39_source_surface (exit 2)
```

Observed:

- Exit code: `2`
- Output: `RAT_41_RAT_235_AUTO_UNBLOCK_BLOCKED:rat39_source_surface`

Interpretation:

- RAT-41 does not reopen RAT-235 on `deps=0` alone.
- Without same-thread READY proof, RAT-235 stays blocked with reason `rat39_source_surface`.

Remaining close condition:

- Run in a runtime where `tools/guardrails/check-rat-157-warehouse-sql-runtime-path.sh` returns:
  - exit `0`
  - marker `RAT_157_WAREHOUSE_SQL_RUNTIME_PATH_READY`
- Attach that READY evidence in RAT-235/RAT-41 thread and apply unblock.

## Replay Evidence (2026-05-11)

Executed:

```bash
tools/guardrails/replay-rat-304-ready-marker-without-runtime-ready.sh
```

Observed:

```text
exit=2
RAT_41_RAT_235_AUTO_UNBLOCK_BLOCKED:rat39_source_surface
RAT_304_REPLAY_OK
script_exit=0
```

Interpretation:

- Even with same-thread READY marker present, RAT-41 keeps RAT-235 blocked when fresh RAT-157 runtime check is not READY.

## Acceptance Replay (2026-05-11)

Executed:

```bash
tools/guardrails/check-rat-304-acceptance.sh
```

Observed:

```text
RAT_304_ACCEPTANCE_PASS
exit=0
```

Coverage:

- Missing same-thread evidence file => blocked (`exit 2` + `RAT_41_RAT_235_AUTO_UNBLOCK_BLOCKED:rat39_source_surface`)
- READY marker only with non-ready runtime guard => blocked (`exit 2` + same blocked reason)
- READY marker + runtime READY (stubbed RAT-157 guard) => unblocked (`exit 0` + `RAT_41_RAT_235_AUTO_UNBLOCK_READY`)
