# RAT-404 Heartbeat: lifecycle status-drift reopen on completed issues (2026-05-11)

## Scope
Issue: `RAT-404` (high priority)

Objective: prevent repeated status-drift reopen loops on completed issues.

Wake delta handled in this heartbeat:
- Comment `ceec17c2-1f88-4930-b1c1-e568ecfb7823` rerouted `RAT-404` from stale queue handling (`RAT-637`) to Back-End Developer for canonical implementation.
- Action impact: execute implementation-attempt path immediately, then publish hard evidence if ownership boundary still blocks patching.

## Action Taken
1. Revalidated current workspace ownership and executable surfaces.
2. Confirmed no control-plane issue lifecycle runtime exists in this repository (`/Users/martinmarquez/uber-services`) for:
- terminal issue status transition guards,
- checkout reopen prevention,
- `issue_status_changed` wake/requeue dedupe.
3. Produced durable blocker record with explicit unblock owner/action (below) to prevent false implementation in a non-owning repository.

## Evidence
- Prior lineage already points to control-plane ownership and same defect family:
  - `docs/analysis/rat-364-auto-reopen-rule-spec-2026-05-11.md`
  - `docs/analysis/rat-371-rat-244-status-drift-investigation-2026-05-11.md`
  - `docs/analysis/rat-390-terminal-state-resume-gate-heartbeat-2026-05-11.md`
- Repo scan in this heartbeat found only application-domain reopen logic (`reviewService.openAppeal`) and tests unrelated to Paperclip issue engine state transitions.
- Executable ownership detector added and run:
  - Script: `tools/guardrails/check-rat-404-done-in-progress-reopen-surface.sh`
  - Result: `BLOCKED_WRONG_REPO` (`exit 2`)
  - Detail: `No control-plane issue lifecycle runtime signatures found in server/*`

## Blocker Declaration
`RAT-404` is **blocked in this workspace**.

- Unblock owner: Paperclip control-plane lifecycle runtime maintainer.
- Unblock action:
  1. Patch issue lifecycle mutation paths in owning runtime so terminal issues (`done`/`cancelled`) cannot reopen without explicit `resume: true`.
  2. Enforce checkout guard so checkout cannot implicitly reopen terminal issues.
  3. Add wake dedupe so no-delta `issue_status_changed` events cannot requeue/reopen completed issues.
  4. Attach API/service-level replay evidence proving:
     - terminal + automation/no-resume => no reopen,
     - explicit `resume:true` => allowed reopen,
     - no-delta status-change wake => no reopen churn.

## Next Technical Step
Once control-plane patch + replay evidence is attached, re-run a targeted regression validation pass against this defect family and close `RAT-404`.

## Verification Artifact
- `qa/test-results/rat-404-reopen-guardrail-ownership-check-2026-05-11.md`
