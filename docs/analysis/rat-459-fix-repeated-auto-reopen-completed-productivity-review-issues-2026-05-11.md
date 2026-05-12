# RAT-459 Heartbeat: fix repeated auto-reopen for completed productivity-review issues (2026-05-11)

## Scope
Stop repeated automatic reopen on completed productivity-review issues when there is no explicit resume intent.

## Heartbeat evidence
1. Wake payload for this run indicates `issue_assigned` on `RAT-459`, with no pending comments and no unresolved blockers in payload context.
2. Guardrail probe executed in this workspace:
   - Command: `bash tools/guardrails/check-rat-435-terminal-silent-run-reopen-surface.sh`
   - Result: `RESULT=BLOCKED_WRONG_REPO`
   - Detail: `No control-plane lifecycle reopen signatures found in server/*`
3. Workspace scan remains consistent with prior RAT lineage (`RAT-395`, `RAT-410`, `RAT-435`, `RAT-439`, `RAT-454`, `RAT-457`): this repository contains product-domain service code, not the Paperclip issue lifecycle mutation runtime owning terminal status transitions.

## Decision
`RAT-459` is blocked in this repository by ownership boundary. The durable fix must land in the Paperclip control-plane runtime that handles issue transitions and wake automation.

## Unblock owner/action
- Owner: Paperclip control-plane lifecycle runtime maintainer.
- Required action:
  1. Enforce terminal immutability: `done`/`cancelled` cannot transition to active states unless payload carries explicit `resume:true` with auditable actor/reason.
  2. Prevent checkout/sweep/status-only automation paths from mutating terminal issues without explicit resume intent.
  3. Dedupe no-delta status-change wakes to suppress repeated reopen/requeue churn.
  4. Add regression replay evidence showing:
     - terminal + automation/no-resume => no reopen,
     - terminal + checkout/no-resume => no mutation,
     - explicit `resume:true` + reason => reopen allowed and audited.

## Exit criteria
- Owning runtime patch merged and deployed.
- Replay evidence attached for negative and positive resume scenarios.
- Affected completed productivity-review issues remain terminal across repeated wake/checkout cycles.

## Wave-1 stale sweep closure update (2026-05-11)
Per thread comment `2517865f-fb93-40b8-ae8d-5972cf0ec1e7`, `RAT-459` is classified as duplicate status-drift lane work.

- Canonical remediation issue: `RAT-568`
- Cluster execution sweep tracker: `RAT-594`
- Reopen policy: only with fresh RAT-459-specific drift evidence after `RAT-568` implementation and QA gate `RAT-383` completion.
