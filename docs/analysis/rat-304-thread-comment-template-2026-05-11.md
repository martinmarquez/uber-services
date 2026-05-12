# RAT-304 Thread Comment Template (RAT-235/RAT-41)

Use this template to post same-thread evidence and unblock decision consistently.

## 1) Generate Evidence

```bash
tools/guardrails/collect-rat-304-rat-235-ready-evidence.sh docs/analysis/rat-304-ready-evidence-$(date +%F).md
```

## 2) If Output Is NOT READY

Condition in evidence file:
- RAT-157 guard exit != 0 or missing marker `RAT_157_WAREHOUSE_SQL_RUNTIME_PATH_READY`
- RAT-41 gate exit != 0 or missing marker `RAT_41_RAT_235_AUTO_UNBLOCK_READY`

Thread comment:

```text
RAT-304 gate check (RAT-235/RAT-41): NOT READY.

Evidence: docs/analysis/rat-304-ready-evidence-<YYYY-MM-DD>.md
Result:
- RAT-157: non-ready
- RAT-41/RAT-235 gate: blocked

Decision: Keep RAT-235 blocked with reason rat39_source_surface.
```

## 3) If Output Is READY

Condition in evidence file:
- RAT-157 guard exit `0` and marker `RAT_157_WAREHOUSE_SQL_RUNTIME_PATH_READY`
- RAT-41 gate exit `0` and marker `RAT_41_RAT_235_AUTO_UNBLOCK_READY`

Thread comment:

```text
RAT-304 gate check (RAT-235/RAT-41): READY.

Evidence: docs/analysis/rat-304-ready-evidence-<YYYY-MM-DD>.md
Result:
- RAT-157: READY (exit 0 + marker)
- RAT-41/RAT-235 gate: READY (exit 0 + marker)

Decision: RAT-235 may be reopened to in_progress per RAT-304 gate policy.
```
