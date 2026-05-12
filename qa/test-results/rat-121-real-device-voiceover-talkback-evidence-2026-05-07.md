# RAT-121 Real-Device Accessibility Evidence (VoiceOver + TalkBack)

Date: 2026-05-07  
Parent context: [RAT-118](/RAT/issues/RAT-118)

## Purpose

Collect execution-grade evidence from physical-device screen reader runs for:
- iOS VoiceOver
- Android TalkBack

This file is the run ledger for final PASS/FAIL proof, defects, and attachments.

## Current Status

`BLOCKED - physical devices and human QA operator required`

Blocker owner: `@board` / QA operations lead  
Unblock action: assign a human tester with iOS + Android devices and upload artifacts in this document.

### Heartbeat Update - 2026-05-08 (RAT-202)

- Re-validated that this execution environment is CLI-only and cannot run VoiceOver/TalkBack on physical mobile devices.
- Confirmed evidence matrix remains pending for all six platform/flow scenarios.
- Quality gate remains closed: no release approval until this ledger contains real-device PASS/FAIL evidence and artifacts.
- Requested unblock owner action in issue thread: assign named human QA operator with device access and post run results here.

### Heartbeat Update - 2026-05-09 (RAT-202)

- Reviewed auto-unblock event from dependency sweep and verified it was not accompanied by new QA evidence.
- Reconfirmed all VoiceOver/TalkBack matrix rows remain `PENDING` and no device recordings/transcripts were attached.
- QA quality gate remains closed pending physical-device execution and artifact upload.

### Heartbeat Update - 2026-05-10 (RAT-202, auto-unblock follow-up)

- Reviewed latest auto-unblock comment (`Auto-unblocked in RAT-41 iterative sweep: deps=0.`).
- Verified this was dependency-state churn only; no new VoiceOver/TalkBack artifacts were attached for RAT-202 scope.
- Reconfirmed all six matrix scenarios remain `PENDING`.
- QA gate remains blocked pending human-operated real-device execution evidence.

### Heartbeat Update - 2026-05-10 (RAT-202, blocker hardening)

- Observed another automated dependency unblock event without attached QA evidence.
- Added explicit blocker-link hardening in issue workflow so this gate is tied to a concrete unresolved blocker issue instead of free-text status alone.
- Evidence requirement is unchanged: all six matrix scenarios need real-device artifacts and PASS/FAIL adjudication.

### Heartbeat Update - 2026-05-10 (RAT-202, human evidence spec triage)

- New human QA comment provided final artifact spec for manual accessibility evidence.
- Added requirement alignment: per-platform submission must include device model, OS version, and app build hash.
- Expanded spoken-focus-order path requirement to cover onboarding, booking, and review submit.
- Gate criteria explicitly reaffirmed: pass/fail must be reported for focus visibility, reading order, actionable labels, and submit-confirmation announcement.

### Heartbeat Update - 2026-05-10 (RAT-202, dependency hardening handoff)

- Confirmed blocker handoff from RAT-289 to RAT-294 in issue graph.
- Verified RAT-202 remains blocked by RAT-294 while human-run evidence collection is in progress.
- Evidence format requirements remain unchanged and tied to CTO checklist criteria.

### Heartbeat Update - 2026-05-11 (RAT-202, normalized dual-blocker gate)

- Confirmed normalized gate model: RAT-202 remains blocked until both RAT-289 (assignment) and RAT-299 (real-device execution evidence) are complete.
- Verified blockers in issue graph now include RAT-289 and RAT-299 concurrently.
- QA release gate remains closed pending completion of both blocker tracks.

## Test Matrix

| Platform | Browser | Flow | Result | Evidence |
| --- | --- | --- | --- | --- |
| iOS + VoiceOver | Safari | Create review | PENDING | pending |
| iOS + VoiceOver | Safari | Report review | PENDING | pending |
| iOS + VoiceOver | Safari | Respond to review | PENDING | pending |
| Android + TalkBack | Chrome | Create review | PENDING | pending |
| Android + TalkBack | Chrome | Report review | PENDING | pending |
| Android + TalkBack | Chrome | Respond to review | PENDING | pending |

## Device Run Script

1. Enable screen reader (VoiceOver or TalkBack) and open the mobile flow.
2. Validate navigation order by swipe gestures from top of screen to submit action.
3. Validate rating control announcement (selected star value, role, set-size cues).
4. Enter comment text and confirm polite counter/live region announcements.
5. Submit create-review flow and verify success message is announced exactly once.
6. Open and complete report-review modal, then verify result announcement.
7. Open and complete respond-to-review modal, then verify result announcement.
8. Re-open each modal once to validate focus return and close behavior.

## Evidence to Attach Per Platform

- Screen recording (audio on) of full create/report/respond path.
- Short transcript of observed announcements (expected vs observed).
- Defect list with severity and reproducible steps.
- Final disposition: `PASS` or `FAIL`.

## Exit Criteria

- Both platforms marked `PASS`, or
- Any `FAIL` item linked to a defect ticket with owner and target fix date.

### Heartbeat Update - 2026-05-10 (RAT-214)

- Confirmed RAT-135 modal accessibility code-path fixes remain present in `src/components/MobileReviewFlow.jsx` (`Escape` close, focus trap, focus restore).
- Logged RAT-214 execution artifact: `qa/test-results/rat-214-manual-voiceover-talkback-validation-rat-135-2026-05-10.md`.
- Real-device matrix is still pending because this environment cannot execute VoiceOver/TalkBack device sessions.
- Gate remains blocked pending board-assigned human QA operator with iOS+Android devices and uploaded recordings/transcripts.

### Heartbeat Update - 2026-05-11 (RAT-389 execution triage)

- Scoped wake received for RAT-389 ("Human QA real-device VoiceOver/TalkBack execution for RAT-121").
- Revalidated RAT-121 matrix rows: all six scenarios remain `PENDING` with no attached recordings, transcripts, or PASS/FAIL adjudication.
- Confirmed this CLI-only execution workspace cannot run physical-device iOS VoiceOver or Android TalkBack sessions.
- Quality gate remains closed: RAT-121 cannot be marked complete until a named human QA operator executes all six matrix rows and uploads required artifacts.
- Unblock owner/action reaffirmed: `@board` must assign a human tester with physical iOS+Android devices and post evidence into this file.
