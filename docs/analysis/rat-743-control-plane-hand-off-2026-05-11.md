# RAT-743 — Control-plane handoff: top-20 blocked normalization

## Wake handling
- Scope source: [RAT-738 wave-2 top-20 blocked normalization list](/Users/martinmarquez/uber-services/docs/analysis/rat-738-wave2-blocker-normalization-top20-2026-05-11.md)
- Current workspace execution mode: not owning Paperclip `/api/issues` lifecycle runtime.

## Required control-plane action
- Apply `PATCH /api/issues/{RAT-xxx}` for each target with `blockedByIssueIds` set to the listed parent issue.
- Validate no circular dependencies are introduced.
- Re-run [RAT-748 blocked queue normalization probe](/Users/martinmarquez/uber-services/docs/analysis/rat-748-blocked-queue-normalization-2026-05-11T095102Z.md).

## Deterministic blockedBy mapping (20 high-priority blocked, last 24h)

1. `RAT-698` -> `blockedByIssueIds = [RAT-684]`
2. `RAT-67` -> `blockedByIssueIds = [RAT-5]`
3. `RAT-324` -> `blockedByIssueIds = [RAT-26]`
4. `RAT-157` -> `blockedByIssueIds = [RAT-156]`
5. `RAT-707` -> `blockedByIssueIds = [RAT-687]`
6. `RAT-328` -> `blockedByIssueIds = [RAT-319]`
7. `RAT-49` -> `blockedByIssueIds = [RAT-15]`
8. `RAT-83` -> `blockedByIssueIds = [RAT-40]`
9. `RAT-653` -> `blockedByIssueIds = [RAT-652]`
10. `RAT-294` -> `blockedByIssueIds = [RAT-291]`
11. `RAT-299` -> `blockedByIssueIds = [RAT-214]`
12. `RAT-320` -> `blockedByIssueIds = [RAT-317]`
13. `RAT-642` -> `blockedByIssueIds = [RAT-639]`
14. `RAT-68` -> `blockedByIssueIds = [RAT-5]`
15. `RAT-27` -> `blockedByIssueIds = [RAT-5]`
16. `RAT-503` -> `blockedByIssueIds = [RAT-328]`
17. `RAT-704` -> `blockedByIssueIds = [RAT-580]`
18. `RAT-614` -> `blockedByIssueIds = [RAT-591]`
19. `RAT-705` -> `blockedByIssueIds = [RAT-687]`
20. `RAT-554` -> `blockedByIssueIds = [RAT-552]`

## Blocking assumptions
- Assignee routing suggests these are already profile-separated in parent issue ownership graph.
- If `PATCH /api/issues` rejects any row due ACL, rotate assignment to owning profile first, then re-apply and verify blocker readback.

## Runtime unblock contract reminder
- Auto-resume remains strictly tied to `blockedByIssueIds` matching resolved blockers and wake source `issue_blockers_resolved`.
- Guardrail updates are now in place in this workspace: [RAT-743 hardening artifact](/Users/martinmarquez/uber-services/docs/analysis/rat-743-blockedby-first-class-auto-resume-hardening-2026-05-11.md)

