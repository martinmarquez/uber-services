# RAT-399 Investigation: recurring status drift on RAT-95 productivity review (2026-05-11)

## Scope
Issue: `RAT-399`

Objective: determine why `RAT-95` (CMO productivity review) repeatedly drifts in lifecycle status and define an executable unblock path.

## Findings
1. `RAT-95` evidence already documents lifecycle ambiguity and stale `in_progress` behavior with no fresh assignee-authored next action in-window.
2. Follow-up CEO review on the same stream (`RAT-108`) confirms repeated system refresh comments (`long_active_duration`) while human next-action signaling remained absent.
3. The reopen/status-drift behavior class maps to the same control-plane lifecycle defect family already investigated across RAT-355/RAT-390 lineage.
4. This workspace (`/Users/martinmarquez/uber-services`) does not contain the owning Paperclip issue lifecycle mutation runtime (`/api/issues` transition engine, checkout reopen gate, no-delta wake dedupe) required to implement the platform fix.

## Evidence
- Source productivity review: `docs/reviews/rat-95-cmo-productivity-review-rat-13.md`
- CEO silent-run/lifecycle follow-up on same source: `docs/reviews/rat-108-ceo-review-silent-active-run-cmo.md`
- Prior platform guardrail lineage:
  - `docs/analysis/rat-355-status-drift-investigation-2026-05-11.md`
  - `docs/analysis/rat-390-terminal-state-resume-gate-heartbeat-2026-05-11.md`
  - `docs/analysis/rat-395-repeated-status-drift-closed-productivity-reviews-2026-05-11.md`
  - `docs/analysis/rat-410-recurring-status-regression-closed-productivity-review-issues-2026-05-11.md`

## Decision
Classify `RAT-399` as blocked in this repository due to missing control-plane ownership for the lifecycle mutation surfaces.

## Unblock Contract
- Unblock owner: Paperclip control-plane lifecycle runtime maintainer.
- Required unblock action:
  1. Enforce terminal-state guard (`done`/`cancelled` immutable unless explicit `resume: true` with actor/reason).
  2. Ensure checkout path cannot implicitly reopen terminal issues.
  3. Add no-delta `issue_status_changed` wake dedupe to suppress status-churn loops.
  4. Attach replay evidence proving:
     - terminal + automation/no-resume => no reopen,
     - terminal + checkout/no-resume => non-mutating,
     - explicit `resume:true` => reopen allowed with audit metadata.

## Next Action
Once control-plane owner ships patch + replay evidence, re-run focused regression checks for RAT-95/RAT-399 lifecycle path and close the issue.
