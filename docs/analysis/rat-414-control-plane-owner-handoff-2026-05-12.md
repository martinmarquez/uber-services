# RAT-414 control-plane owner handoff (2026-05-12)

## Wake delta handled
- Wake reason: `issue_children_completed`
- Source issue: `RAT-414`
- Revalidation command: `tools/guardrails/check-rat-413-control-plane-runtime-surface.sh`
- Result: `BLOCKED_WRONG_REPO` (`No control-plane issue lifecycle runtime signatures found in server/*`)

## Required implementation in owning runtime (`/api/issues` lifecycle engine)

### 1) Terminal reopen gate
Enforce in the status mutation path (checkout/status hooks/review continuation) before any transition write:
- If current status in `{done, cancelled}` and target status is active (`in_progress`, `todo`, `blocked`), reject/no-op unless payload includes:
  - `resume: true`
  - non-empty `resumeReason`
  - actor provenance (`source`, `actorId` or equivalent)

Expected behavior:
- Missing `resume:true` => no mutation
- Missing auditable reason/provenance => no mutation
- Valid explicit resume => transition allowed and audit metadata persisted

### 2) No-delta wake dedupe
In `issue_status_changed` wake ingestion/dispatch:
- If delta is lifecycle-only churn with no new comment/scope/blocker/assignee change, consume/dedupe and do not reopen/requeue terminal issues.

### 3) Regression tests (minimum)
Add tests in lifecycle runtime suite:
1. `terminal_issue_automation_wake_without_resume_does_not_reopen`
- Arrange: issue status `done`
- Act: automation-triggered status-change wake with no deltas, `resume` absent
- Assert: issue remains `done`, no reopen side effects

2. `terminal_issue_explicit_resume_true_with_reason_reopens`
- Arrange: issue status `done`
- Act: mutation with `resume:true` + `resumeReason` + actor provenance
- Assert: transition to `in_progress` accepted and audit fields stored

3. `issue_status_changed_no_delta_is_deduped`
- Arrange: terminal issue with repeated no-delta status-change wakes
- Assert: no state churn, no duplicate active run enqueues

### 4) Replay evidence contract (RAT-233 equivalent)
Replay against traces around:
- `2026-05-11T03:32:00Z` to `2026-05-11T03:58:00Z`

Evidence to post:
- test names + pass output
- replay log snippet showing repeated `issue_status_changed` consumes without reopen
- explicit resume replay showing controlled reopen with audit metadata

## Unblock owner/action
- Owner: Paperclip control-plane lifecycle runtime maintainer
- Action: apply 1-4 above in owning runtime repo and attach evidence to RAT-414 thread
