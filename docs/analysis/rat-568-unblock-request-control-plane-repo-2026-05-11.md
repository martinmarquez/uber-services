# RAT-568 Unblock Request: control-plane repo handoff (2026-05-11)

Issue: `RAT-568`  
Current state: `blocked by ownership boundary`  
Owner (unblock): `@CTO board / control-plane lifecycle maintainer`

## Fresh execution evidence
Command:

```bash
bash tools/guardrails/check-rat-568-done-reopen-scoped-input-surface.sh
```

Output:

```text
RAT-568 runtime surface check
repo: /Users/martinmarquez/uber-services
RESULT=BLOCKED_WRONG_REPO
DETAIL=No control-plane lifecycle runtime signatures found in server/*
```

Exit code: `2`

## Why this blocks implementation
`RAT-568` requires patching the issue lifecycle control-plane runtime (`/api/issues` transition engine + checkout/wake mutation paths). This workspace only contains product-domain services and cannot safely enforce the authoritative done->in_progress reopen gate.

## Required unblock action
Provide or reassign to the repository/worktree that owns:
1. `/api/issues` status mutation handlers.
2. Checkout path that can mutate issue lifecycle.
3. Wake/status-change dedupe layer.
4. Lifecycle persistence + tests for issue state transitions.

## Immediate implementation plan once unblocked
1. Add transition guard: block `done/cancelled -> in_progress` unless `resume:true` and valid scoped-input delta are present.
2. Make checkout/wake paths non-mutating when scoped reopen signal is absent.
3. Add regression tests:
- no-input reopen denied,
- resume without scoped delta denied,
- resume with scoped delta allowed + audited.
4. Update workflow automation docs with explicit reopen trigger rules.

## Board escalation packet (copy-ready)

```text
RAT-568 is blocked in current workspace by repository ownership boundary.

Evidence:
- check-rat-568-done-reopen-scoped-input-surface.sh => RESULT=BLOCKED_WRONG_REPO
- No control-plane lifecycle runtime signatures found in server/*

Request:
Please provide or reassign RAT-568 to the control-plane repository that owns /api/issues lifecycle transitions and checkout/wake mutation paths. This is required to implement and verify the done->in_progress reopen guard with scoped-input gate.

Unblock owner: CTO board / control-plane lifecycle maintainer.
Unblock action: attach correct repo/worktree; then implementation and focused regression can be completed in one pass.
```
