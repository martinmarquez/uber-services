# RAT-463 — Investigate RAT-72 status auto-reopen loop (2026-05-11)

## Wake scope
- Issue: `RAT-463`
- Reason: `issue_assigned`
- Latest comment batch: `0/0` (no new thread delta)

## Goal Gate
- `PRODUCT_BRIEF.md` exists in `/Users/martinmarquez/uber-services/PRODUCT_BRIEF.md`.

## Evidence
1. `RAT-72` is currently `done`, but thread history shows repeated re-close actions on 2026-05-11 without new human scope comments:
- 2026-05-11T04:07:09.675Z: status-drift correction comment.
- 2026-05-11T04:17:23.404Z: re-close comment + creation of RAT-463.
2. `RAT-72` lifecycle timestamps indicate reactivation before last re-close:
- `startedAt`: 2026-05-11T04:16:59.951Z
- `completedAt`: 2026-05-11T04:17:23.368Z
3. Current wake payload for `RAT-463` had no comment delta (`0/0`), consistent with non-comment lifecycle mutation.

## Findings
1. The reopen pattern on RAT-72 matches the existing platform-level status-drift defect family (terminal issue auto-reactivation without explicit resume intent).
2. This repository does not contain the owning Paperclip control-plane lifecycle mutation runtime (`/api/issues` transition engine, checkout reopen guard, wake dedupe path), so no authoritative local code patch is possible here.

## Conclusion
- `RAT-463` is blocked by external control-plane lifecycle ownership, not by application-domain code in `uber-services`.

## Unblock Owner and Action
- Unblock owner: `@board` (route to control-plane lifecycle maintainer).
- Unblock action:
  1. Enforce terminal-state immutability by default (`done`/`cancelled` non-mutating unless explicit `resume:true` with actor+reason provenance).
  2. Ensure checkout and status-only/no-delta automation paths cannot reopen terminal issues.
  3. Add replay regression evidence for RAT-72-equivalent sequence proving no implicit reopen.
