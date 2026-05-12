# RAT-738 — Wave-2 top-20 high-priority blocked normalization pass (2026-05-11)

## Wake handling
- Wake reason: `issue_assigned` continuation
- Status source: `qa/test-results/rat-709-cto-cluster-snapshot-2026-05-11T09:36:13Z.json`
- Scope selected: `status=blocked`, `priority=high`, `lastActivityAt` within 24h, missing/empty `blockedByIssueIds`

## Top-20 candidates (high-priority, updated in last 24h)
1. RAT-698 — lastActivity 2026-05-11T09:36:06.365Z
2. RAT-67 — 2026-05-11T09:36:06.354Z
3. RAT-324 — 2026-05-11T09:35:41.755Z
4. RAT-157 — 2026-05-11T09:35:14.709Z
5. RAT-707 — 2026-05-11T09:34:46.708Z
6. RAT-328 — 2026-05-11T09:34:38.728Z
7. RAT-49 — 2026-05-11T09:34:38.664Z
8. RAT-83 — 2026-05-11T09:34:38.598Z
9. RAT-653 — 2026-05-11T09:34:38.535Z
10. RAT-294 — 2026-05-11T09:34:38.470Z
11. RAT-299 — 2026-05-11T09:34:38.409Z
12. RAT-320 — 2026-05-11T09:34:38.350Z
13. RAT-642 — 2026-05-11T09:34:38.292Z
14. RAT-68 — 2026-05-11T09:34:38.228Z
15. RAT-27 — 2026-05-11T09:34:38.167Z
16. RAT-503 — 2026-05-11T09:34:38.104Z
17. RAT-704 — 2026-05-11T09:34:03.473Z
18. RAT-614 — 2026-05-11T09:33:36.820Z
19. RAT-705 — 2026-05-11T09:32:56.123Z
20. RAT-554 — 2026-05-11T09:32:12.587Z

## Parent linkage status
- All 20 entries have empty/zero-edge `blockedByIssueIds` at extraction time.
- Most entries are `TODO` for explicit blocker edges because a parent-derived link was not automatically applied in this lane.

## Required unblock action
- Unblock owner/action: Control-plane lifecycle owner with `PATCH /api/issues` privileges.
- Required path:
  1. Map each issue to its parent/true blocking issue from canonical issue graph.
  2. Set deterministic `blockedByIssueIds` for each of the above 20 issues.
  3. Post a blocker contract note in each child issue with unblock owner/action/ETA until dependency is cleared.
  4. Re-run `rat-748` probe and verify blockedBy coverage grows by +20.

## Evidence of blocker gap
- [RAT-748 blocked queue normalization evidence](/Users/martinmarquez/uber-services/docs/analysis/rat-748-blocked-queue-normalization-2026-05-11T095102Z.md) reports: 149 blocked issues, 149 missing `blockedByIssueIds`, 0 auto-filled.
