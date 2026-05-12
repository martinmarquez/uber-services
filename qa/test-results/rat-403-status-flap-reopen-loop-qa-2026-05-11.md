# RAT-403 QA Evidence - status flap reopening loop (2026-05-11)

## Scope
- Issue: `RAT-403`
- Goal: verify whether reopen-loop fix can be implemented/validated in this workspace.

## Verification performed
1. Loaded issue heartbeat context and objective from Paperclip API.
2. Scanned repository for control-plane issue lifecycle surfaces (`/api/issues` lifecycle transitions, checkout-side mutation, `issue_status_changed` dedupe).
3. Confirmed only product-domain status logic exists here (reviews/service request domain), not Paperclip control-plane lifecycle engine.
4. Cross-checked prior analysis artifacts documenting same root-cause family.
5. Revalidated recurrence on wake `issue_status_changed`: RAT-403 was auto-shifted to `in_progress` at `2026-05-11T04:05:49.814Z` with no new thread comments (`0/0`).

## Result
- QA implementation/validation in this workspace is **blocked** by missing ownership surface.
- Release quality gate for this defect family remains **FAIL** pending control-plane patch evidence.
- Recurrence signal is now stronger: blocker state itself is being overwritten by lifecycle drift.

## Unblock owner and required evidence
- Owner: Paperclip control-plane lifecycle maintainer.
- Required evidence package:
  1. Terminal-state resume gate enforced (`done`/`cancelled` do not reopen without explicit `resume: true`).
  2. Checkout path cannot mutate terminal issue status without explicit resume intent.
  3. No-delta `issue_status_changed` wakes are deduplicated.
  4. Blocked-state protection: dependency-blocked issues must not be auto-promoted to active statuses without explicit unblock delta.
  5. Replay regression logs proving:
     - terminal + no resume => no reopen,
     - explicit resume => allowed reopen,
     - no-delta wake => no reopen churn,
     - blocked issue + no unblock delta => remains blocked.

## Linked artifacts
- `docs/analysis/rat-355-status-drift-investigation-2026-05-11.md`
- `docs/analysis/rat-404-lifecycle-status-drift-reopen-blocker-2026-05-11.md`

## Recurrence Check (2026-05-11T09:52:21Z)
- Re-check: issue status observed as `in_progress` (`updatedAt: 2026-05-11T09:52:21.321Z`) again despite `0/0` comments and no workspace control-plane fix.
- Re-open event confirms issue is still being force-reopened by external lifecycle automation.
- Continued final disposition: `blocked`.
