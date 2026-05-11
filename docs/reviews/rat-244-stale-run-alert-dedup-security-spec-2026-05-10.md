# RAT-244 Security Spec: Suppress Duplicate Stale-Run Alerts for Terminal Source Issues

Date: 2026-05-10  
Owner: Security Engineer

## Problem
Repeated stale/silent-run triage tickets are being emitted for the same run fingerprint even when the source issue is already terminal (`done`/`cancelled`) or when the same stale condition was already triaged recently.

Security/operations impact:
- Alert fatigue lowers incident response quality.
- Duplicate triage can hide real regressions in queue noise.
- Stale `activeRun` pointers on terminal issues create integrity drift in run-state signaling.

## Required Controls
1. Terminal-state guard before alert emission.
- If source issue status is `done` or `cancelled`, do not open stale-run triage issue.

2. Dedup cooldown by `(sourceIssueId, runFingerprint)`.
- Before creating a new stale-run triage issue, query recent stale-run triage issues keyed to the same source issue and run fingerprint.
- If a matching issue exists in cooldown window, suppress creation and append an audit event (`suppressed_duplicate_stale_run_alert`).
- Cooldown should be configurable via env (default recommended: `24h`).

3. One-shot stale-pointer recovery on terminal source issues.
- When stale-run detection sees a terminal source issue with `activeRun` still set, clear the pointer once.
- Record audit event (`cleared_terminal_issue_active_run_pointer`) with source issue id and run id.
- This action must be idempotent and safe to retry.

4. Regression coverage.
- Add tests for:
  - terminal source issue -> no triage issue created
  - duplicate stale condition inside cooldown -> no second issue
  - duplicate stale condition outside cooldown -> issue allowed
  - terminal source issue with stale pointer -> pointer cleared once

## Security Acceptance Criteria
- No stale-run triage issue is created when source issue is terminal.
- Duplicate issue creation rate for same `(sourceIssueId, runFingerprint)` reduced to zero within cooldown.
- Recovery action never mutates non-terminal source issues.
- Audit logs capture both suppression and pointer-clear events.

## Suggested Configuration
- `STALE_RUN_ALERT_DEDUP_COOLDOWN_MS=86400000`

## Operational Notes
- Add a runbook note clarifying that suppression is expected behavior for repeated stale fingerprints on terminal source issues.
- Keep unsuppressed path intact for non-terminal issues so real silent-run incidents continue to page owners.

## 2026-05-10 Verification Update (Security)
- Verification environment: `/Users/martinmarquez/paperclip/paperclip`
- Command run: `pnpm -s vitest server/src/__tests__/heartbeat-active-run-output-watchdog.test.ts`
- Result: **failed** (`1/11`), regression in test `re-arms continue decisions after the default quiet window` at `server/src/__tests__/heartbeat-active-run-output-watchdog.test.ts:400`.
- Failure detail: expected `afterRearm.created` to be `1`, received `0`.

Security disposition:
- RAT-244 remains **blocked** pending regression remediation and re-test evidence.
- Blocker issue opened: [RAT-296](/RAT/issues/RAT-296) (owner: CTO).

## 2026-05-10 Final Verification Update (Security Sign-off)
- Verified regression fix from [RAT-296](/RAT/issues/RAT-296) in runtime repo.
- Command: `pnpm -s vitest server/src/__tests__/heartbeat-active-run-output-watchdog.test.ts`
- Result: **pass** (`11/11`).

Confirmed coverage in passing run:
- re-arm behavior after quiet window
- terminal-source suppression + stale pointer clear
- in-window dedup suppression
- out-of-window re-alert

Disposition:
- Security acceptance criteria for RAT-244 are satisfied.
