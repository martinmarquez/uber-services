# RAT-454 Heartbeat: fix RAT-201 productivity-review auto-reopen loop (2026-05-11)

## Scope
Stop repeated automatic reopen of productivity-review issue `RAT-201` when no new actionable delta exists.

## What I checked in this heartbeat
1. Acknowledged wake context from inline payload (`issue_assigned`, `RAT-454`, no pending comments, no blocker ids).
2. Re-scanned this workspace for owning lifecycle mutation surfaces:
   - `/api/issues` transition engine
   - terminal checkout reopen guard
   - no-delta `issue_status_changed` dedupe path
3. Verified this repository contains product-domain review/appeal logic (`server/src/domain/reviewService.js`) and tests for appeal reopen semantics, but not the Paperclip control-plane lifecycle engine that mutates issue statuses.

## Result
`RAT-454` is the same control-plane terminal-state drift defect family already documented in RAT-355 / RAT-364 / RAT-390 / RAT-435 / RAT-437 / RAT-441.

This workspace (`/Users/martinmarquez/uber-services`) is non-owning for the runtime that must be patched, so a direct fix here would be a surrogate and non-durable.

## Unblock owner/action
- Owner: Paperclip control-plane lifecycle runtime maintainer.
- Required action:
  1. Enforce terminal immutability (`done`/`cancelled`) unless explicit `resume:true` with auditable actor/reason.
  2. Make checkout/status-only automation non-mutating for terminal issues.
  3. Dedupe no-delta `issue_status_changed` wakes to prevent reopen churn.
  4. Attach replay regression evidence on a `RAT-201`-equivalent fixture proving reopen count remains `0` without explicit resume intent.

## Exit criteria for RAT-454
- Owning runtime patch merged and deployed.
- Replay evidence attached for negative (no resume) and positive (explicit `resume:true`) scenarios.
- RAT-201 and RAT-454 remain terminal across repeated wake/checkout cycles.
