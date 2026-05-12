# RAT-647 Heartbeat: stop productivity-review reopen churn (no-delta guard + follow-up route) (2026-05-11)

Issue: `RAT-647` (high priority)

## Wake handling

- Wake reason: `issue_assigned`
- Pending comments acknowledged: `0/0` (no new thread deltas in wake payload)
- Goal gate: passed (`PRODUCT_BRIEF.md` exists at repo root)

## Evidence captured this heartbeat

1. Runtime ownership probe:
   - Command: `bash tools/guardrails/check-rat-404-done-in-progress-reopen-surface.sh`
   - Result: `RESULT=BLOCKED_WRONG_REPO`
   - Detail: `No control-plane issue lifecycle runtime signatures found in server/*`
2. Reopen-ledger sample check for this issue id:
   - Command: `bash tools/guardrails/check-rat-448-productivity-review-reopen-ledger.sh RAT-647`
   - Result: `RESULT=TARGET_NOT_FOUND`
   - Detail: local ledger extract has reopen churn events but no RAT-647 row yet.

## Decision

This workspace cannot implement the RAT-647 fix directly. The required guard lives in the Paperclip control-plane lifecycle runtime, not in `uber-services` domain code.

Required surfaces are upstream:

- `/api/issues` status transition engine
- terminal-state reopen/resume gate (`done`/`cancelled`)
- no-delta status-change wake dedupe path
- follow-up routing path that creates or links execution child work instead of reopening closed productivity-review parents

## Follow-up route (owner/action)

- Owner: control-plane lifecycle maintainer (CTO/runtime lane)
- Action:
  1. Enforce no-delta reopen suppression: terminal issues must remain terminal unless explicit `resume: true` with actor+reason provenance.
  2. Add follow-up routing: when new work is required after closure, route to child/execution issue creation or explicit follow-up lane instead of parent reopen.
  3. Attach replay evidence showing repeated automatic wakes/checkouts do not reopen closed productivity-review issues.

## Next action

Keep `RAT-647` blocked on control-plane patch delivery. Resume validation in this workspace only after upstream runtime evidence is attached.
