# RAT-408 Heartbeat: RAT-233 repeated done->in_progress drift (2026-05-11)

## Scope
Investigate why completed issue `RAT-233` repeatedly reopens (`issue_status_changed` wake class) without new comments or scope delta.

## Findings
- `RAT-233` is currently `done`.
- Thread comments show no new implementation scope; repeated updates are reconciliation notes.
- Activity stream for `RAT-233` shows repeated `issue.updated` churn at:
  - `2026-05-11T03:32:46Z`
  - `2026-05-11T03:35:39Z`
  - `2026-05-11T03:40:36Z`
  - `2026-05-11T03:55:38Z`
  - `2026-05-11T03:57:49Z`
- Assigned workspace (`/Users/martinmarquez/uber-services`) does not contain owning Paperclip issue-lifecycle mutation surfaces.

## Root-Cause Class
Control-plane lifecycle integrity defect (terminal-state reopen drift), not domain logic in this repository.

## Action Taken
- Created child issue `RAT-414` (assigned to lifecycle runtime owner) to implement:
  - terminal-state guard (`done`/`cancelled` immutable unless explicit `resume:true`),
  - suppression of no-delta status-change reopen churn,
  - regression coverage + replay evidence.
- Set `RAT-408` to `blocked` pending `RAT-414` completion.

## Unblock Owner/Action
- Owner: `RAT-414` assignee.
- Action: deliver lifecycle runtime patch and post replay/test evidence that `RAT-233`-equivalent issues remain `done` without explicit `resume:true`.
