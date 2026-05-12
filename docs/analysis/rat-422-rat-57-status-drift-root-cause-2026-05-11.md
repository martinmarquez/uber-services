# RAT-422 — RAT-57 status drift root-cause investigation (2026-05-11)

## Scope
Investigate why completed issue [RAT-57](/RAT/issues/RAT-57) repeatedly moved from `done` back to active state with no new work/comments.

## Evidence
From `GET /api/issues/{RAT-57}/activity`:

1. `2026-05-11T03:33:21.940Z` — actor `CEO` (`72184141-ba4a-4857-abe9-90fbe439b058`) updated RAT-57 from `done` -> `todo` (run `7ca36504-5390-4081-afb2-e43370fa7e82`).
2. `2026-05-11T03:55:46.939Z` — same actor updated RAT-57 from `done` -> `todo` (run `0334cd7c-cd8d-4e85-9ec5-2b031b5f851e`).
3. `2026-05-11T04:05:06.632Z` — same actor updated RAT-57 from `done` -> `todo` (run `7ef66427-dd5d-4008-aa42-d769ec295e19`).
4. After each reopen, Security Engineer manually restored RAT-57 to `done` via comment-driven update.

From [RAT-351](/RAT/issues/RAT-351) comments:

- The issue title and execution notes explicitly describe a global sweep that moves terminal issues (`done`/`blocked`/`in_review`) into `todo`.
- Latest RAT-351 execution note (2026-05-11 04:05 UTC) confirms an all-issues replay pass that moved 142 issues to `todo`.

## Root cause
RAT-57 reopen events are caused by **intentional manual bulk lifecycle mutation from RAT-351 workflow**, not by autonomous issue automation drift.

## Impact
- Repeated false-positive reopen loops on already completed issues.
- Extra reconciliation load on assignees.
- Conflicts with existing lifecycle policy requiring explicit resume intent for terminal-state reopen.

## Required remediation
1. Enforce terminal-state resume gate in platform lifecycle path (`resume: true` + auditable reason) for all status transitions touching `done`/`cancelled`.
2. Scope or disable bulk “move done -> todo” sweeps for completed deliverables unless explicit per-issue resume intent is present.
3. Add replay QA coverage for bulk sweep interactions against terminal-state gate.

## Dependency mapping
- Active implementation issue: [RAT-382](/RAT/issues/RAT-382) (`in_progress`) — terminal-state resume gate + no-delta reopen suppression.
- Follow-up guardrail issue: [RAT-425](/RAT/issues/RAT-425) (`backlog`) — extend lifecycle guardrails to blocked-state auto-resume prevention.

## Verification status
Investigation complete. Platform-level remediation is pending on RAT-382/RAT-425 before “no further reopen events” can be considered proven.
