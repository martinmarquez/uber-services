# RAT-743 — Blocked queue first-class blocker links hardening (2026-05-11)

## Wake handling
- Wake reason: `issue_assigned`
- Pending comments: `0/0`
- Action taken: implemented and verified guardrail hardening in this workspace.

## Change summary
- Updated `tools/guardrails/issueLifecycleGuard.js`:
  - added canonical normalization for `blockedByIssueIds` and `resolvedBlockerIssueIds` in `shouldAutoResumeFromBlockerResolution`.
  - normalization behavior: trim IDs, drop empty/non-string entries, dedupe values.
- Kept eligibility gate strict and unchanged:
  1. status must be `blocked`,
  2. normalized `blockedByIssueIds` must be non-empty,
  3. normalized resolved blocker delta must be non-empty,
  4. at least one resolved blocker must match current blocker link,
  5. resume source must be `issue_blockers_resolved`.

## Verification
Command:
```bash
node --test tools/guardrails/issueLifecycleGuard.test.js
```

Result:
- `PASS` (`19/19` tests)
- Added regression tests covering:
  - whitespace-normalized blocker IDs,
  - duplicate blocker IDs in payloads.

## Next action
- Port identical normalization semantics into the control-plane lifecycle runtime (`/api/issues` owner repo) if not already present, to keep blocked-queue auto-resume behavior consistent across environments.
