# RAT-538 Control-Plane Guardrail: Block Implicit Terminal Reopen Without `resume:true` (2026-05-11)

## Scope and prerequisite check
- Date: 2026-05-11.
- Requested change: enforce control-plane guardrail that prevents terminal issue reopen unless mutation is explicit with `resume:true`.
- Architecture prerequisite: attempted to read `ADR.md` before code changes.
  - Checked repo-local and assigned workspace canonical path:
    - `/Users/martinmarquez/uber-services/ADR.md` (missing)
    - `$AGENT_HOME/ADR.md` where `AGENT_HOME=/Users/martinmarquez/.paperclip/instances/default/workspaces/0472b077-0242-486a-8fd3-9ef248206448` (missing)

## Runtime ownership verification
Executed runtime-surface probe:

```bash
bash tools/guardrails/check-rat-413-control-plane-runtime-surface.sh
```

Observed output:

```text
RAT-413 runtime surface check
repo: /Users/martinmarquez/uber-services
RESULT=BLOCKED_WRONG_REPO
DETAIL=No control-plane issue lifecycle runtime signatures found in server/*
```

## Assessment
- This workspace does not contain the owning control-plane lifecycle mutation runtime required to implement `done/cancelled -> active` reopen guards.
- Requested implementation point is external to this repository boundary (`/api/issues` transition engine, checkout reopen gate, and wake dedupe layer).
- No API/database change was made here because applying a guard in this repo would be non-authoritative and unsafe.

## Required implementation in owning runtime
1. Reject any terminal reopen attempt unless payload includes `resume: true`.
2. Require auditable reopen metadata (`actor`, `reason`, mutation source).
3. Enforce same gate on checkout-triggered implicit reopen paths.
4. Add regression tests:
- terminal + no `resume:true` => no status mutation,
- terminal + `resume:true` => reopen allowed and audited,
- repeated wake/checkout without delta => no reopen.

## Block status
- State: blocked by repository ownership boundary.
- Unblock owner: `@CTO` / control-plane lifecycle runtime maintainer.
- Unblock action: land guardrail and regression evidence in the owning control-plane repository, then re-run RAT-538 validation.
