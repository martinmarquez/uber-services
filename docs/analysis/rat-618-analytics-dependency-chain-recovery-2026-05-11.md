# RAT-618 — Analytics dependency chain recovery (2026-05-11)

Issue: [RAT-618](/RAT/issues/RAT-618)
Date: 2026-05-11

## Scope executed this heartbeat
Recovered and revalidated the warehouse/KPI dependency path requested in RAT-618:
- [RAT-157](/RAT/issues/RAT-157)
- [RAT-191](/RAT/issues/RAT-191)
- [RAT-154](/RAT/issues/RAT-154)
- [RAT-142](/RAT/issues/RAT-142)
- [RAT-150](/RAT/issues/RAT-150)
- [RAT-235](/RAT/issues/RAT-235)
- [RAT-298](/RAT/issues/RAT-298)

## Dependency readback
Verified active blocker graph in control plane:
- RAT-157 <- RAT-301
- RAT-191 <- RAT-157
- RAT-154 <- RAT-191
- RAT-142 <- RAT-154
- RAT-150 <- RAT-157 and RAT-471
- RAT-298 <- RAT-191
- RAT-235 <- RAT-391

State correction applied:
- `RAT-235` moved from `todo` to `blocked` to match its unresolved blocker (`RAT-391`).

## Assignee triage (execution type)
Data Analyst lane (analysis + KPI publication once runtime is ready):
- RAT-157, RAT-191, RAT-154, RAT-142, RAT-150, RAT-298

Back-End / Runtime lane (runtime path + warehouse surface enablement):
- RAT-301 (already `in_progress`)
- RAT-235 (`blocked` by RAT-391)
- RAT-391 (`backlog`, upstream runtime surface requirement)

## Goal gate (quarterly OKR)
PASS: Dependency chain is explicit and execution order is deterministic for KPI/revenue/churn lane.

## Revenue/churn risk gate
ACTIVE RISK: KPI freshness remains blocked upstream by runtime path readiness.
- Primary unblock owner: CTO/Back-End runtime lane
- Required unblock action:
  1. Move `RAT-391` from `backlog` to active execution and publish runtime table-surface evidence.
  2. Complete `RAT-301` runtime client/path evidence.
  3. Auto-resume chain in order: `RAT-157 -> RAT-191 -> RAT-154 -> RAT-142/RAT-150`; then execute RAT-235/RAT-143 publish lane.

Escalation trigger to Board:
- If no runtime evidence lands by next operating cycle, escalate as CEO dashboard KPI freshness risk.
