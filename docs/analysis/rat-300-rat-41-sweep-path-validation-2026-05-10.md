# RAT-300 RAT-41 Sweep Path Validation (2026-05-10)

Issue: [RAT-300](/RAT/issues/RAT-300)  
Scope: prevent deps-only auto-unblock on [RAT-290](/RAT/issues/RAT-290) and [RAT-191](/RAT/issues/RAT-191)

## Paths Patched in This Repo

1. **Issue-level runtime guard path**
   - `tools/guardrails/check-rat-290-runtime-warehouse-credentials.sh`
   - `tools/guardrails/check-rat-191-runtime-warehouse-credentials.sh`

2. **RAT-41 sweep decision gate path (new)**
   - `tools/guardrails/check-rat-41-rat-290-rat-191-auto-unblock.sh`
   - Enforces both same-thread READY markers and fresh runtime READY execution for RAT-290 and RAT-191.

3. **Deterministic replay harness (new)**
   - `tools/guardrails/replay-rat-300-deps-only-unblock-test.sh`

## Command Validation (timestamp: 2026-05-10 local run)

### 1) Deps-only evidence must be blocked

Command:

```bash
tools/guardrails/replay-rat-300-deps-only-unblock-test.sh
```

Output:

```text
CASE1_DEPS_ONLY_EXIT:2
CASE1_DEPS_ONLY_OUT:RAT_41_RAT_290_RAT_191_AUTO_UNBLOCK_BLOCKED:runtime_guard_not_ready
CASE2_READY_EVIDENCE_EXIT:2
CASE2_READY_EVIDENCE_OUT:RAT_41_RAT_290_RAT_191_AUTO_UNBLOCK_BLOCKED:runtime_guard_not_ready
```

Interpretation: without runtime creds, deps-only signals cannot transition to unblock.

### 2) READY evidence + READY runtime can unblock

Command:

```bash
DATABASE_URL='postgres://example' tools/guardrails/replay-rat-300-deps-only-unblock-test.sh
```

Output:

```text
CASE1_DEPS_ONLY_EXIT:2
CASE1_DEPS_ONLY_OUT:RAT_41_RAT_290_RAT_191_AUTO_UNBLOCK_BLOCKED:runtime_guard_not_ready
CASE2_READY_EVIDENCE_EXIT:0
CASE2_READY_EVIDENCE_OUT:RAT_41_RAT_290_RAT_191_AUTO_UNBLOCK_READY
```

Interpretation: even with runtime creds present, deps-only evidence remains blocked; unblock is only allowed when evidence+runtime gates both pass.

## Acceptance Mapping

- **No deps-only unblock while guard is MISSING**: proven by CASE1 exit `2` and BLOCKED marker.
- **Deterministic replay added**: `replay-rat-300-deps-only-unblock-test.sh`.
- **Multiple paths documented**: runtime guard path + RAT-41 sweep gate path listed above.
