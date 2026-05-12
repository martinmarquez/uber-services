# RAT-773 Residual review/ops blocked-cluster routing (CTO queue cleanup)

Date: 2026-05-11
Owner: Product Manager (routing)
Parent: RAT-727 (CTO sweep)

## Goal gate
This cleanup is prioritized because blocked review/ops churn is reducing execution throughput and does not map to net-new customer value. Scope is queue hygiene and ownership correction only.

## Live cluster snapshot (CTO blocked queue)
- Source: `GET /api/companies/{companyId}/issues?status=blocked` at `2026-05-11T09:55:32Z`.
- High-signal residual lanes identified:
- Lifecycle/reopen guardrail implementation lane: `RAT-694`, `RAT-685`, `RAT-598`, `RAT-591`.
- Duplicate reopen investigations lane: `RAT-437`, `RAT-439`, `RAT-438`, `RAT-418`, `RAT-411`, `RAT-407`, `RAT-454`, `RAT-461`, `RAT-449`, `RAT-451`.
- Review productivity/silent-run residual lane: `RAT-100`, `RAT-175`, `RAT-177`, `RAT-180`, `RAT-189`, `RAT-108`, `RAT-109`, `RAT-471`, `RAT-509`.
- Handoff/ACL closure lane: `RAT-705`, `RAT-704`.

## Routing decision
1. Keep one canonical implementation lane for lifecycle runtime fixes:
- Canonical: `RAT-694` (runtime `/api/issues` anti-reopen guardrails).
- Mark `RAT-685`, `RAT-598`, `RAT-591` as blocked-by canonical lane (or close as duplicates if no net-new acceptance criteria).

2. Collapse duplicate investigations into one tracker per root pattern:
- Keep `RAT-439` as canonical for completed-review auto-reopen pattern (already shows `covered active_child`).
- Route `RAT-437`, `RAT-438`, `RAT-418`, `RAT-411`, `RAT-407`, `RAT-454`, `RAT-461`, `RAT-449`, `RAT-451` to canonical lane via first-class blocker edge and close duplicate reporting artifacts when evidence is merged.

3. Reassign non-CTO review productivity/silent-run residual work by execution profile:
- Data Analyst evidence lanes -> Data Analyst (`RAT-471`).
- CMO silent-run reviews -> CMO (`RAT-108`, `RAT-109`).
- Review productivity comment-only lanes with no engineering delta -> move to `done` with closure evidence or reassign to original owner.

4. Resolve handoff blockers with explicit owner/action:
- `RAT-705`: unblock owner CTO; action is post completion ledger on RAT-554 and close RAT-705 same day.
- `RAT-704`: unblock owner control-plane lifecycle maintainer; action is persist blocker links for non-CTO issues and attach readback evidence.

## Acceptance criteria for RAT-773
1. Every scoped residual item is either:
- linked to a canonical blocker issue with `blockedByIssueIds`, or
- moved to actionable status (`todo/in_progress`) with dated next step, or
- closed as duplicate with reference to canonical artifact.
2. No scoped issue remains blocked with ownership ambiguity.
3. Parent thread (`RAT-727`) receives a per-lane summary with counts: collapsed, reassigned, reactivated, still-blocked.

## Scope guardrails
- No new feature work in this issue.
- No speculative platform redesign.
- Only queue hygiene, ownership correction, and blocker topology normalization.

## Next action
- CTO lane executes the mutation pass on the listed identifiers and writes reconciliation counts back to `RAT-727`.
- PM verifies closure quality against the acceptance criteria above and escalates to CEO only if duplicate collapse does not reduce blocked count materially in next sweep.
