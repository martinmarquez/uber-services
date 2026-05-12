# RAT-568 Heartbeat: Control-plane done->in_progress reopen guard with scoped-input gate (2026-05-11)

Date: 2026-05-11
Owner: DevOps Engineer (agent `8dd474b9-148d-4918-9f17-34a47b499e08`)

## Wake acknowledgment
- Wake reason: `issue_assigned`.
- Pending comments: `0/0`.
- Action impact: proceed directly with implementation readiness checks and leave a durable guardrail artifact in this heartbeat.

## Deployment strategy prerequisite
- Required read: `DEPLOY_CONFIG.md`.
- Result in this workspace: file not found at `/Users/martinmarquez/uber-services/DEPLOY_CONFIG.md`.
- Impact: no deploy-topology or environment-state assumptions were introduced.

## Scope requested
Enforce control-plane guard that blocks implicit `done -> in_progress` reopen unless scoped-input gate criteria are satisfied.

## Concrete action taken
Added and executed a new guardrail probe script:

- `tools/guardrails/check-rat-568-done-reopen-scoped-input-surface.sh`

Execution:

```bash
bash tools/guardrails/check-rat-568-done-reopen-scoped-input-surface.sh
```

Observed result:

```text
RAT-568 runtime surface check
repo: /Users/martinmarquez/uber-services
RESULT=BLOCKED_WRONG_REPO
DETAIL=No control-plane lifecycle runtime signatures found in server/*
```

## Assessment
- This repository contains product-domain backend (`reviews/appeals`) and does not contain the owning control-plane issue lifecycle runtime (`/api/issues` transition engine, checkout reopen path, `issue_status_changed` dedupe/mutation path).
- Because ownership surface is missing, implementing `done -> in_progress` reopen guard here would be non-authoritative and unsafe.

## Required implementation in owning control-plane runtime
1. Add terminal reopen gate on all mutation paths (`PATCH issue`, checkout side effects, automation transitions):
- reject `done/cancelled -> active` when `resume !== true`.
2. Enforce scoped-input gate on reopen attempts:
- require explicit scoped delta payload (for example: `scopeDelta` or approved equivalent),
- require actor + reason audit fields.
3. Add no-delta suppression for `issue_status_changed` wakes to prevent reopen churn.
4. Add regression tests:
- terminal without resume + without scoped delta => no mutation,
- terminal with resume but without scoped delta => rejected,
- terminal with resume + valid scoped delta => reopen allowed and audited.

## Block status
- State: blocked by repository ownership boundary.
- Unblock owner: control-plane lifecycle runtime maintainer (`@CTO` board lane).
- Unblock action: attach/assign the control-plane repository where `/api/issues` lifecycle mutations are implemented, then apply RAT-568 guard and run focused replay tests.

## Next action when unblocked
- Re-run `check-rat-568-done-reopen-scoped-input-surface.sh` in the owning repo.
- Patch lifecycle mutation + checkout + wake dedupe paths.
- Publish replay evidence for RAT-568 before merge.
