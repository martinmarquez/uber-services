# RAT-372 Follow-up (issue_blockers_resolved) - 2026-05-11

## Wake Delta Handled
- Wake reason: `issue_blockers_resolved`
- Scope actioned: move from duplicate-blocker-only posture to direct control-plane hardening verification.

## Concrete Implementation Progress
Control-plane repo is available at:
- `/Users/martinmarquez/paperclip/paperclip`

Patch applied:
- Added regression test to prevent blocker-resolution wake candidates from including terminal dependents (`done`), closing a RAT-372 status-flap vector tied to `issue_blockers_resolved` wake churn.
- File changed:
  - `/Users/martinmarquez/paperclip/paperclip/server/src/__tests__/issues-service.test.ts`
- Test added:
  - `it("does not return terminal dependents when blockers resolve", ...)`

## Verification Attempt
Command run:
- `cd /Users/martinmarquez/paperclip/paperclip/server && npx vitest run src/__tests__/issues-service.test.ts -t "does not return terminal dependents when blockers resolve"`

Result:
- Vitest executed but all tests in file were skipped on this host due embedded Postgres init failure (`Skipping embedded Postgres issue service tests on this host...`).

## Current State
- Code-level mitigation has been added in the owning control-plane test suite.
- Host-specific DB bootstrap prevented local execution of this test in this heartbeat.

## Unblock Owner And Action
- Owner: Backend Platform (control-plane repo maintainer)
- Action:
1. Run the targeted test on a host/CI lane where embedded Postgres integration tests are enabled.
2. Attach passing run evidence to RAT-372 (or canonical RAT-568 lane if consolidated there).
3. Keep RAT-372 closed/duplicate unless fresh issue-specific drift evidence appears post RAT-568 + RAT-383.

## Additional Mitigation Applied (Control-plane route guard)
To remove stale-read race risk between dependent selection and wake dispatch, a dispatch-time terminal-state guard was added.

Code changes:
- `/Users/martinmarquez/paperclip/paperclip/server/src/routes/issues.ts`
  - In the `becameDone` -> `issue_blockers_resolved` wake loop, route now re-reads each dependent via `svc.getById(dependent.id)` and skips wake if status is terminal (`done`/`cancelled`).

Regression test added and executed:
- `/Users/martinmarquez/paperclip/paperclip/server/src/__tests__/issue-dependency-wakeups-routes.test.ts`
  - `it("does not wake terminal dependents on blocker-resolution wake dispatch", ...)`
- Command:
  - `cd /Users/martinmarquez/paperclip/paperclip/server && npx vitest run src/__tests__/issue-dependency-wakeups-routes.test.ts`
- Result:
  - PASS (`3 passed`), including the new test.

## Remaining Verification Gap
- Service-layer integration test (`issues-service.test.ts`) still needs CI/host replay with embedded Postgres available to validate the DB-backed wakeable-dependent selector path.

## Guard Centralization + Fast Local Verification
To reduce dependence on embedded-Postgres integration harness for core lifecycle guard semantics, wake guard logic was centralized into a pure service module with unit tests.

New module:
- `/Users/martinmarquez/paperclip/paperclip/server/src/services/issue-wakeup-guards.ts`
  - `isTerminalIssueStatus(status)`
  - `isWakeableBlockedDependentStatus(status)`

Integrations:
- `/Users/martinmarquez/paperclip/paperclip/server/src/services/issues.ts`
  - `listWakeableBlockedDependents` now uses `isWakeableBlockedDependentStatus`.
- `/Users/martinmarquez/paperclip/paperclip/server/src/routes/issues.ts`
  - dispatch-time guard now uses `isTerminalIssueStatus`.

Tests added/executed:
- `/Users/martinmarquez/paperclip/paperclip/server/src/__tests__/issue-wakeup-guards.test.ts` (new)
- `/Users/martinmarquez/paperclip/paperclip/server/src/__tests__/issue-dependency-wakeups-routes.test.ts` (updated)

Command:
- `cd /Users/martinmarquez/paperclip/paperclip/server && npx vitest run src/__tests__/issue-wakeup-guards.test.ts src/__tests__/issue-dependency-wakeups-routes.test.ts`

Result:
- PASS (`2 files`, `5 tests`).
- Non-blocking warning remains in mocked route path (`db.select is not a function`) unrelated to wake guard assertions.

## Embedded-Postgres Lane Continuation Attempt (run_liveness_continuation)
Action taken in control-plane DB test harness:
- Updated `/Users/martinmarquez/paperclip/paperclip/packages/db/src/test-embedded-postgres.ts` to add startup fallback retry for embedded Postgres test instances (fresh temp dir + retry path).

Probe executed:
- `cd /Users/martinmarquez/paperclip/paperclip/server && pnpm exec tsx -e "import {getEmbeddedPostgresTestSupport} from '../packages/db/src/test-embedded-postgres.ts'; ..."`
- Output: `{"supported":false,"reason":"Postgres init script exited with code 1. Please check the logs for extra info. The data directory might already exist."}`

Service test lane re-run:
- `cd /Users/martinmarquez/paperclip/paperclip/server && npx vitest run src/__tests__/issues-service.test.ts -t "does not return terminal dependents when blockers resolve"`
- Result: still skipped for host support reason above.

### Interpretation
- RAT-372 mitigation code and local unit/route regressions remain green.
- Embedded-Postgres integration lane is still blocked by host runtime constraints, now with explicit probe evidence after retry-path hardening.

### Unblock Owner And Action
- Owner: DevEx / Runtime Platform (control-plane CI environment owner)
- Action:
1. Run `issues-service.test.ts` in CI runner where embedded Postgres init is supported.
2. Attach pass/fail artifact for test `does not return terminal dependents when blockers resolve`.
3. If CI fails with same init message, collect embedded-postgres init logs from runner and patch platform image/runtime prerequisites.

## Root Cause Found For Embedded-Postgres Skip (Host Runtime)
With diagnostic capture enabled, the skip reason is now explicit and actionable:
- `FATAL: could not create shared memory segment: Cannot allocate memory`
- PostgreSQL hint references kernel shared-memory limits (`SHMALL`) as likely root cause.

This converts the prior generic skip into a concrete platform unblock requirement.

Evidence command:
- `cd /Users/martinmarquez/paperclip/paperclip/server && npx vitest run src/__tests__/issues-service.test.ts -t "does not return terminal dependents when blockers resolve"`

Observed output includes both primary and fallback startup attempts failing with shared-memory allocation errors.

### Updated Unblock Owner And Action
- Owner: DevEx / Runtime Platform
- Action:
1. Increase/enable shared-memory availability for CI/runner host used for embedded Postgres tests (kernel SHM settings / container IPC limits).
2. Re-run `issues-service.test.ts` targeted selector test and attach passing artifact.
3. If still failing, attach full init logs (now emitted by harness diagnostics) and environment config diff.

## Canonical Unblock Probe Script Added
To give DevEx/Runtime a single reproducible command with host diagnostics + targeted lane result, added:
- `/Users/martinmarquez/paperclip/paperclip/server/scripts/rat-372-embedded-postgres-probe.sh`

Executed successfully on this host with full evidence capture:
- Host kernel SHM values (`kern.sysv.shm*`),
- `getEmbeddedPostgresTestSupport()` result with primary/fallback diagnostics,
- targeted `issues-service.test.ts` lane output.

Latest execution timestamp:
- `2026-05-12T03:33:28Z` (UTC) from probe output.

Operational instruction for owner:
1. Run this script in CI/runtime host.
2. If support remains false with SHM allocation errors, increase shared-memory/IPC limits in runner.
3. Re-run until embedded support is true, then execute targeted selector test as pass evidence.
