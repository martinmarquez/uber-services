# RAT-355 Status Drift Investigation (2026-05-11)

Issue: RAT-355  
Target: explain why RAT-35 repeatedly leaves `done` without scope/comment delta.

## Evidence gathered

1. Parent issue thread (`RAT-35`) shows repeated human corrections back to terminal state with no new product scope:
- 2026-05-11T03:28:25Z: set back to `done` after validation.
- 2026-05-11T03:33:05Z: reopened again; RAT-355 created to investigate.
- 2026-05-11T03:34:03Z and 03:34:16Z: converted to `blocked` to stop drift loop.

2. Heartbeat run history for RAT-35 confirms **automation-triggered wakes** after status changes:
- Run `c5264d8a-9d1c-4414-9f36-02630e56af2d` (`03:27:23Z`) context `wakeReason=issue_status_changed`, source `automation`.
- Run `680f3918-5d0f-43c7-b996-4e5232c22c68` (`03:32:29Z`) context `wakeReason=issue_status_changed`, source `automation`.
- Run `27c6a9fd-a68c-4bbc-b413-6927bc92b4a9` (`03:33:47Z`) context `wakeReason=issue_status_changed`, source `automation`.

3. Current RAT-35 state now appears as `todo` (not `done`), again without new comment-driven scope delta, reinforcing state-machine drift.
4. Follow-up heartbeat evidence on RAT-355 itself shows the same class of drift:
- 2026-05-11T03:39:43Z: RAT-355 explicitly moved to `blocked` with named unblock chain (RAT-378 -> RAT-380 -> RAT-381).
- 2026-05-11T04:05:33Z: RAT-355 changed back to `in_progress` with no new thread comments (`0/0` wake payload), indicating non-human lifecycle mutation persists.
- 2026-05-11T04:13:04Z: RAT-355 changed back to `in_progress` again after re-normalization, still without comment-driven scope delta, confirming recurring automated mutation.

## Root-cause hypothesis (high confidence)

The status-change automation path is re-queuing the same assignee on lifecycle transitions and the subsequent heartbeat/checkout path is mutating status out of terminal states without requiring an explicit resume intent or new comment/scope trigger.

Additional signal: the same mutation behavior applies to `blocked` lifecycle control states, not only `done`.

## Product risk

- Roadmap/state integrity risk: completed milestones appear active again.
- Operational noise: unnecessary wake cycles and duplicate triage.
- Prioritization risk: sprint board shows false WIP.

## Guardrail spec (proposed fix)

1. **Terminal-state resume gate**
- For issues in `done`/`cancelled`, reject automatic transition back to `todo`/`in_progress` unless payload includes explicit `resume: true` and audit actor.

2. **Status-change wake dedupe rule**
- Suppress `issue_status_changed` auto-wake when transition is terminal-finalization only (no comment delta, no blocker delta, no assignment delta).

3. **Checkout status safety**
- Checkout must not implicitly reopen terminal issues. If issue is terminal and no `resume: true`, return non-mutating response.

4. **Audit trail requirement**
- Persist `change_source` metadata for every status transition (`manual_comment`, `manual_patch`, `automation_rule`, `checkout_side_effect`) so drift can be explained in one query.

## Verification criteria

- Replay regression scenario for RAT-35 equivalent fixture and verify no reopen within 24h under repeated status-change wakes.
- Add integration test asserting terminal issues remain terminal without explicit resume intent.
- Verify board WIP count unchanged after terminal closure event.

## PM decision

No net-new feature scope. Treat as platform reliability fix, priority aligned to roadmap guardrail: trust-quality and execution hygiene.

## Product story (implementation-ready)

### User story
As a product/ops stakeholder, when an issue is marked `done` or `cancelled`, I need it to stay terminal unless an explicit resume action is taken, so sprint state, WIP limits, and roadmap reporting remain trustworthy.

### Acceptance criteria
1. Given an issue in `done` or `cancelled`, when automation or checkout runs without `resume: true`, then issue status remains unchanged.
2. Given an issue in `done` or `cancelled`, when a human sends status/comment payload with `resume: true`, then issue may transition to `todo`/`in_progress` and audit log stores actor + reason.
3. Given terminal-finalization transitions (`in_progress` -> `done` etc.), when no scope/comment/blocker/assignee delta exists, then `issue_status_changed` wake is deduped.
4. For every status transition, system persists `change_source` and `change_reason` fields queryable from issue history.
5. Regression fixture mirroring RAT-35 lifecycle shows zero automatic reopen events across repeated wake/checkouts in 24h simulation window.
6. Regression also asserts no automatic transition from `blocked` to `in_progress` unless blocker resolution or explicit human resume signal is present.

## Sprint sequencing and ownership

1. Backend platform: implement terminal resume gate in issue status transition layer.
2. Automation/runtime: add wake dedupe policy and checkout non-mutating guard for terminal issues.
3. Data/audit: persist transition provenance fields and expose in issue event thread.
4. QA: add integration regression covering RAT-35 equivalent replay.
5. PM signoff gate: validate board WIP count stability before/after closure replay.

## Scope gate

- In scope: lifecycle state integrity and auditability only.
- Out of scope: new workflow statuses, board UX redesign, notification policy expansion.
- Anti-scope-creep rule: any proposal that changes issue lifecycle model semantics beyond resume gating requires CEO review before sprint commitment.

## Escalation triggers to CEO

- If fix requires breaking API contract for issue status payloads.
- If ETA exceeds current sprint by more than 2 business days.
- If additional resourcing is requested from non-platform teams.

## Next action (this heartbeat)

Publish this spec as the source of truth for engineering kickoff on RAT-355 and request immediate implementation split into backend + automation + QA child tickets with explicit dependency order.

## Additional same-cycle evidence (2026-05-11T04:13Z-04:14Z)

- 2026-05-11T04:13:46Z: RAT-355 patched to `blocked` + `high` with explicit unblock chain.
- 2026-05-11T04:13:53Z: immediately after posting heartbeat comment, RAT-355 transitioned to `todo` at matching timestamp, suggesting comment/automation side effect path can mutate state.
- 2026-05-11T04:14:05Z: non-comment patch (`status=blocked`) restored control state.

Implication: guardrail implementation must cover comment-adjacent lifecycle mutations, not only checkout/status-change wake paths.

## Additional drift event (2026-05-11T04:24Z)

- 2026-05-11T04:24:35Z: RAT-355 transitioned to `in_progress` again under `issue_status_changed` wake with `0/0` pending comments.
- This event occurs after prior high-priority escalation and child hotfix creation (`RAT-450`), confirming ongoing automatic mutation before mitigation execution.

Decision impact: escalation threshold has been reached; CEO sprint-priority override is now required per prior trigger definition.

## CTO heartbeat addendum (2026-05-11T18:22:00-03:00)

- Reconfirmed recurrence class: `issue_status_changed` wake can mutate issue lifecycle from control states (`done`/`blocked`) back to `in_progress` without comment delta.
- Governance lock recorded in `$AGENT_HOME/ADR.md` Decision 155:
  - terminal immutability by default,
  - explicit `resume:true` + actor/reason required for reopen,
  - no-delta wake path must be non-mutating.
- Disposition for RAT-355 remains `blocked` until control-plane runtime owner ships RAT-450 and downstream fixes (`RAT-378`, `RAT-380`, `RAT-425`, `RAT-381`) with replay and 24h stability evidence.
