# RAT-830 — Integrate scoped resume gate into control-plane `/api/issues` lifecycle runtime (heartbeat 2026-05-11)

## Context
- Wake reason: `issue_assigned`.
- Mandatory pre-read completed: `ADR.md` (2026-05-11) confirms explicit API contracts, idempotency, and lifecycle guardrails as active architecture rules.
- Expected implementation surface for RAT-830 is control-plane issue lifecycle runtime (`/api/issues` transitions, checkout mutation path, wake dedupe path).

## What I validated in this checkout
1. Repository server runtime scope is product review domain (`/api/v1/reviews`) and lacks `/api/issues` mutation handlers.
2. Search across `server/src`, `server/tests`, and `server/scripts` found no lifecycle runtime signatures for control-plane issue state transitions.
3. Existing local helper logic exists in `tools/guardrails/issueLifecycleGuard.js`, but it is not the authoritative `/api/issues` runtime integration path requested by RAT-830.

## Evidence command
```bash
tools/guardrails/check-rat-830-api-issues-lifecycle-surface.sh
```

## Blocker
- This workspace cannot perform the required runtime integration because the owning control-plane `/api/issues` lifecycle code is not present.

## Unblock owner/action
- Owner: Control-plane lifecycle runtime maintainer.
- Action:
  1. Apply scoped resume gate in `/api/issues` transition layer and checkout/wake mutation paths.
  2. Enforce: terminal issues (`done`/`cancelled`) immutable unless explicit `resume:true` with provenance.
  3. Attach replay evidence for: terminal-no-resume deny, checkout non-mutation, explicit resume allow + audit, no-delta dedupe behavior.

## Next action after unblock
- Re-run replay assertions in owning repo and attach pass/fail matrix back to RAT-830.
