# RAT-371 Investigation: repeated status drift reopening RAT-244 (2026-05-11)

Issue: `RAT-371`  
Target: explain why closed issue [RAT-244](/RAT/issues/RAT-244) was reopened repeatedly.

## Evidence snapshot

1. `RAT-244` is currently terminal (`done`) via API:
- `completedAt`: `2026-05-11T03:35:41.107Z`
- `updatedAt`: `2026-05-11T03:35:41.587Z`

2. `RAT-244` comments show two same-window drift corrections after closeout and without new work-trigger context:
- `2026-05-11T03:33:46.488Z`: "Issue status drift correction... reopened to in_progress without new comments/blockers/evidence"
- `2026-05-11T03:35:41.582Z`: "Second status-drift correction... again set to in_progress with no new comments (0/0), no blocker changes, no failing evidence"

3. Run timeline for `RAT-244` during the drift window:
- `2026-05-11T03:33:28Z` run succeeded
- `2026-05-11T03:35:02Z` run succeeded
- an overlapping run starting `2026-05-11T03:31:26Z` later marked failed (`finishedAt 2026-05-11T03:37:27Z`)

## Assessment

- This event matches the already-known defect class documented in:
  - `docs/analysis/rat-355-status-drift-investigation-2026-05-11.md`
  - `docs/analysis/rat-364-auto-reopen-rule-spec-2026-05-11.md`
  - `docs/analysis/rat-374-rat-231-followup-implementation-status-2026-05-11.md`
- No evidence indicates new RAT-244 scope, new blocker delta, or new failure evidence drove the reopen.
- Highest-confidence diagnosis remains lifecycle mutation drift in the control-plane transition/wake path, not business-domain repo behavior.

## Gap to close

Even with terminal-checkout guardrails and selective wake suppression in place, this RAT-244 replay shows another reopen path still exists.

Required follow-up evidence in the owning control-plane runtime:
1. event-level trace for each status mutation on RAT-244 during `2026-05-11 03:31Z-03:36Z` UTC,
2. mutation source attribution (`manual_comment`, `automation_rule`, `checkout_side_effect`, etc.),
3. proof that all terminal reopen vectors now require explicit `resume:true`.

## Next action

Platform owner for lifecycle runtime (`RAT-364` assignee) should attach the control-plane transition trace and patch evidence, then `RAT-371` can close as verified.
