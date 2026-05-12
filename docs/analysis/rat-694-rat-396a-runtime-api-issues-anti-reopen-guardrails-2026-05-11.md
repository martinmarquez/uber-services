# RAT-694 / RAT-396A — Runtime `/api/issues` anti-reopen guardrails (2026-05-11)

## Scope acknowledged
Implement anti-reopen guardrails in the owning issue lifecycle runtime (`/api/issues`, checkout mutation path, and no-delta `issue_status_changed` wakes).

## What was executed in this heartbeat
1. Re-validated workspace scope and ownership surface.
2. Ran executable guardrail regression unit tests in this workspace:

```bash
node --test tools/guardrails/issueLifecycleGuard.test.js
```

Result: `11/11` tests passed.

3. Ran control-plane surface ownership check:

```bash
bash tools/guardrails/check-rat-568-done-reopen-scoped-input-surface.sh
```

Result:
- `RESULT=BLOCKED_WRONG_REPO`
- `DETAIL=No control-plane lifecycle runtime signatures found in server/*`

## Assessment
- This checkout (`uber-services`) contains product/review-domain reopen guardrails and local guardrail helpers, but not the canonical control-plane runtime that mutates issue lifecycle state through `/api/issues`.
- Direct implementation for RAT-694 cannot be safely completed here without patching the wrong system.

## Unblock owner/action
- Owner: control-plane lifecycle runtime maintainer (workspace/repo that owns `/api/issues` transitions).
- Action:
  1. Apply terminal reopen gate: `done/cancelled` cannot reopen without explicit `resume:true` plus actor/reason provenance.
  2. Make checkout path non-mutating for terminal issues unless explicit scoped resume is present.
  3. Deduplicate no-delta `issue_status_changed` wakes so they cannot reactivate lifecycle.
  4. Attach replay evidence and regression tests in owning runtime.

## Next verification step after unblock
Re-run RAT-383/RAT-398 style lifecycle replay in owning runtime and attach before/after mutation trace proving:
- terminal + no resume => no reopen,
- checkout + no resume => no reopen,
- explicit resume with provenance => single auditable reopen.
