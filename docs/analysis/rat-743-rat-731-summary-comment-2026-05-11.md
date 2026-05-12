# RAT-743 -> RAT-731 summary comment payload (2026-05-11)

Use the block below as the parent-thread summary comment on `RAT-731`.

```md
RAT-743 execution summary (2026-05-11)

Outcome:
- Prepared deterministic first-class blocker-link normalization map for top 20 high-priority blocked issues (last 24h) under control-plane ownership.
- Auto-resume guardrail remains strict: only `blockedByIssueIds`-matched `issue_blockers_resolved` events can resume blocked issues.

Updated issue set targeted for explicit `blockedByIssueIds`:
- [RAT-698](/RAT/issues/RAT-698) -> [RAT-684](/RAT/issues/RAT-684)
- [RAT-67](/RAT/issues/RAT-67) -> [RAT-5](/RAT/issues/RAT-5)
- [RAT-324](/RAT/issues/RAT-324) -> [RAT-26](/RAT/issues/RAT-26)
- [RAT-157](/RAT/issues/RAT-157) -> [RAT-156](/RAT/issues/RAT-156)
- [RAT-707](/RAT/issues/RAT-707) -> [RAT-687](/RAT/issues/RAT-687)
- [RAT-328](/RAT/issues/RAT-328) -> [RAT-319](/RAT/issues/RAT-319)
- [RAT-49](/RAT/issues/RAT-49) -> [RAT-15](/RAT/issues/RAT-15)
- [RAT-83](/RAT/issues/RAT-83) -> [RAT-40](/RAT/issues/RAT-40)
- [RAT-653](/RAT/issues/RAT-653) -> [RAT-652](/RAT/issues/RAT-652)
- [RAT-294](/RAT/issues/RAT-294) -> [RAT-291](/RAT/issues/RAT-291)
- [RAT-299](/RAT/issues/RAT-299) -> [RAT-214](/RAT/issues/RAT-214)
- [RAT-320](/RAT/issues/RAT-320) -> [RAT-317](/RAT/issues/RAT-317)
- [RAT-642](/RAT/issues/RAT-642) -> [RAT-639](/RAT/issues/RAT-639)
- [RAT-68](/RAT/issues/RAT-68) -> [RAT-5](/RAT/issues/RAT-5)
- [RAT-27](/RAT/issues/RAT-27) -> [RAT-5](/RAT/issues/RAT-5)
- [RAT-503](/RAT/issues/RAT-503) -> [RAT-328](/RAT/issues/RAT-328)
- [RAT-704](/RAT/issues/RAT-704) -> [RAT-580](/RAT/issues/RAT-580)
- [RAT-614](/RAT/issues/RAT-614) -> [RAT-591](/RAT/issues/RAT-591)
- [RAT-705](/RAT/issues/RAT-705) -> [RAT-687](/RAT/issues/RAT-687)
- [RAT-554](/RAT/issues/RAT-554) -> [RAT-552](/RAT/issues/RAT-552)

Evidence artifacts:
- [RAT-743 control-plane handoff](/Users/martinmarquez/uber-services/docs/analysis/rat-743-control-plane-hand-off-2026-05-11.md)
- [RAT-743 auto-resume hardening](/Users/martinmarquez/uber-services/docs/analysis/rat-743-blockedby-first-class-auto-resume-hardening-2026-05-11.md)
- [RAT-748 blocked queue baseline](/Users/martinmarquez/uber-services/docs/analysis/rat-748-blocked-queue-normalization-2026-05-11T095102Z.md)

Acceptance-state note:
- AC1/AC2/AC3 are implementation-ready but require control-plane runtime mutation rights (`PATCH /api/issues`) to complete in-system writes and post final applied-links proof.

Unblock owner/action:
- Owner: control-plane lifecycle maintainer
- Action: apply 20 `blockedByIssueIds` patches above, verify no cycle rejects, rerun blocked queue probe, and confirm coverage delta in-thread.
```
