# RAT-591 — Stale Sweep Consolidation: status-flapping/reopen defect cluster (2026-05-11)

## Scope
Collapse duplicate issue threads that report the same control-plane lifecycle defect: terminal or near-terminal issues auto-transitioning back to `in_progress` (or flapping) without explicit human resume intent.

## Canonical remediation track
- Canonical implementation issue: [RAT-568](/RAT/issues/RAT-568)
- Canonical policy/spec issue: [RAT-404](/RAT/issues/RAT-404)
- Canonical QA replay gate: [RAT-383](/RAT/issues/RAT-383)

## Duplicate cluster (current open inventory)
The following open issues match the same defect family and should be merged into the canonical track unless they contain unique reproducible vectors:

- [RAT-355](/RAT/issues/RAT-355)
- [RAT-357](/RAT/issues/RAT-357)
- [RAT-361](/RAT/issues/RAT-361)
- [RAT-362](/RAT/issues/RAT-362)
- [RAT-363](/RAT/issues/RAT-363)
- [RAT-364](/RAT/issues/RAT-364)
- [RAT-367](/RAT/issues/RAT-367)
- [RAT-368](/RAT/issues/RAT-368)
- [RAT-371](/RAT/issues/RAT-371)
- [RAT-372](/RAT/issues/RAT-372)
- [RAT-374](/RAT/issues/RAT-374)
- [RAT-377](/RAT/issues/RAT-377)
- [RAT-382](/RAT/issues/RAT-382)
- [RAT-390](/RAT/issues/RAT-390)
- [RAT-394](/RAT/issues/RAT-394)
- [RAT-395](/RAT/issues/RAT-395)
- [RAT-397](/RAT/issues/RAT-397)
- [RAT-399](/RAT/issues/RAT-399)
- [RAT-402](/RAT/issues/RAT-402)
- [RAT-406](/RAT/issues/RAT-406)
- [RAT-407](/RAT/issues/RAT-407)
- [RAT-411](/RAT/issues/RAT-411)
- [RAT-412](/RAT/issues/RAT-412)
- [RAT-413](/RAT/issues/RAT-413)
- [RAT-414](/RAT/issues/RAT-414)
- [RAT-415](/RAT/issues/RAT-415)
- [RAT-416](/RAT/issues/RAT-416)
- [RAT-417](/RAT/issues/RAT-417)
- [RAT-418](/RAT/issues/RAT-418)
- [RAT-419](/RAT/issues/RAT-419)
- [RAT-422](/RAT/issues/RAT-422)
- [RAT-424](/RAT/issues/RAT-424)
- [RAT-426](/RAT/issues/RAT-426)
- [RAT-432](/RAT/issues/RAT-432)
- [RAT-435](/RAT/issues/RAT-435)
- [RAT-437](/RAT/issues/RAT-437)
- [RAT-438](/RAT/issues/RAT-438)
- [RAT-439](/RAT/issues/RAT-439)
- [RAT-440](/RAT/issues/RAT-440)
- [RAT-441](/RAT/issues/RAT-441)
- [RAT-442](/RAT/issues/RAT-442)
- [RAT-443](/RAT/issues/RAT-443)
- [RAT-447](/RAT/issues/RAT-447)
- [RAT-448](/RAT/issues/RAT-448)
- [RAT-449](/RAT/issues/RAT-449)
- [RAT-451](/RAT/issues/RAT-451)
- [RAT-452](/RAT/issues/RAT-452)
- [RAT-454](/RAT/issues/RAT-454)
- [RAT-455](/RAT/issues/RAT-455)
- [RAT-456](/RAT/issues/RAT-456)
- [RAT-457](/RAT/issues/RAT-457)
- [RAT-459](/RAT/issues/RAT-459)
- [RAT-460](/RAT/issues/RAT-460)
- [RAT-461](/RAT/issues/RAT-461)
- [RAT-462](/RAT/issues/RAT-462)
- [RAT-463](/RAT/issues/RAT-463)
- [RAT-465](/RAT/issues/RAT-465)
- [RAT-469](/RAT/issues/RAT-469)
- [RAT-537](/RAT/issues/RAT-537)
- [RAT-538](/RAT/issues/RAT-538)

## Merge policy
1. Keep only canonical implementation/status on `RAT-568`.
2. Move unique reproduction traces from duplicate issues into canonical artifact chain.
3. Close duplicates as `done` with comment: "Merged into RAT-568 canonical remediation track. Reopen only with new reproducible vector not covered by RAT-568 acceptance criteria."
4. If a duplicate still carries execution-critical ownership details, set `blockedByIssueIds` to `RAT-568` and mark `blocked` instead of keeping it active.

## Completion criteria for this stale sweep
- No duplicate issue in this family remains `in_progress` without unique vector evidence.
- Canonical issue (`RAT-568`) holds implementation status, replay evidence links, and final acceptance outcome.
- QA gate (`RAT-383`) validates terminal guard + checkout no-reopen + no-delta wake dedupe.
