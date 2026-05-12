# RAT-738 -> RAT-731 summary comment draft (2026-05-11)

Use this as the canonical thread update on RAT-731.

## Comment body

RAT-738 update (2026-05-11): first-class blocker-link auto-resume guardrails are now implemented in workspace policy code, and Wave-2 blocked-queue normalization targets are defined.

Delivered in this lane:
- Guardrail hardening completed for blocker-resolution auto-resume path:
  - `blocked` status required
  - non-empty `blockedByIssueIds` required
  - resolved blocker delta required
  - at least one resolved blocker must match an existing blocker link
  - source must be `issue_blockers_resolved`
- Wave-2 target manifest produced for high-priority blocked issues updated in last 24h:
  - [RAT-698](/RAT/issues/RAT-698)
  - [RAT-67](/RAT/issues/RAT-67)
  - [RAT-324](/RAT/issues/RAT-324)
  - [RAT-157](/RAT/issues/RAT-157)
  - [RAT-707](/RAT/issues/RAT-707)
  - [RAT-328](/RAT/issues/RAT-328)
  - [RAT-49](/RAT/issues/RAT-49)
  - [RAT-83](/RAT/issues/RAT-83)
  - [RAT-653](/RAT/issues/RAT-653)
  - [RAT-294](/RAT/issues/RAT-294)
  - [RAT-299](/RAT/issues/RAT-299)
  - [RAT-320](/RAT/issues/RAT-320)
  - [RAT-642](/RAT/issues/RAT-642)
  - [RAT-68](/RAT/issues/RAT-68)
  - [RAT-27](/RAT/issues/RAT-27)
  - [RAT-503](/RAT/issues/RAT-503)
  - [RAT-704](/RAT/issues/RAT-704)
  - [RAT-614](/RAT/issues/RAT-614)
  - [RAT-705](/RAT/issues/RAT-705)
  - [RAT-554](/RAT/issues/RAT-554)

Current blocker:
- This checkout cannot execute control-plane lifecycle mutations (`PATCH /api/issues`) needed to persist `blockedByIssueIds` on those 20 issues.

Unblock owner/action:
- Owner: control-plane lifecycle maintainer
- Action:
1. Apply first-class `blockedByIssueIds` updates to all 20 issues listed above.
2. Validate no circular blocker chains are introduced.
3. Post completion evidence on RAT-731 with updated issue links and blocker graph check result.

Artifacts:
- `docs/analysis/rat-738-wave2-blocker-normalization-top20-2026-05-11.md`
- `docs/analysis/rat-748-blocked-queue-normalization-2026-05-11T095102Z.md`
- `docs/analysis/rat-743-blockedby-first-class-auto-resume-hardening-2026-05-11.md`
