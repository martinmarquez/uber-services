# RAT-374 / RAT-231 Follow-up: Implementation Status And Remaining Gate (2026-05-11)

## Wake Scope
Issue: `RAT-374` (follow-up on lifecycle auto-reopen regression) linked to `RAT-231` QA retest context.

## What Was Revalidated In This Heartbeat
1. Governance + spec are already locked:
- `docs/analysis/rat-355-status-drift-investigation-2026-05-11.md`
- `docs/analysis/rat-364-auto-reopen-rule-spec-2026-05-11.md`
- `docs/analysis/rat-363-workflow-fix-rat-115-auto-reopen-loop-2026-05-11.md`

2. Prior implementation evidence exists outside this repo in Paperclip control-plane code:
- Terminal checkout guard (`done`/`cancelled` cannot be checked out into active state without explicit resume flow).
- Targeted regression test for terminal checkout behavior.

3. Local QA artifact remains green for implemented `resume` guard in this workspace:
- `qa/test-results/rat-383-no-reopen-terminal-issues-regression-2026-05-11.md`
- Latest rerun in artifact: `node --test server/tests/*.test.js` with passing suite.

## Current Gap (Why RAT-374 Follow-up Still Matters)
This repository (`uber-services`) does not contain the issue lifecycle runtime modules (`issue transition layer`, `checkout mutation`, `issue_status_changed` wake dedupe) where the remaining RAT-231-style end-to-end guardrails execute.

Result: regression confidence is currently split across:
- direct code-level tests in Paperclip server repo,
- artifact-based replay in this repo.

## Required Next Action
Owner: Backend Platform (Paperclip control-plane repo owner)

Action:
1. Run API-level replay in the issue-lifecycle repo for:
- terminal issue + automation wake without `resume:true` => no reopen,
- terminal issue + checkout without explicit resume transition => reject/non-mutating,
- explicit `resume:true` + reason => allowed reopen.
2. Publish run IDs, assertions, and final pass/fail evidence back to `RAT-374` thread.
3. If all pass, close follow-up lane and keep rule as baseline policy.

## Decision
No scope expansion approved in this heartbeat. Lifecycle semantics remain:
- terminal states stay terminal by default,
- reopen requires explicit `resume:true` with auditable intent.

## Wave-1 Stale Sweep Closure Update (2026-05-11)
Latest thread comment (`6ef0671f-0f2f-4839-81c5-afbf94815b46`) classifies `RAT-374` as a duplicate lifecycle/status-drift lane.

Canonical execution path:
- Implementation lane: `RAT-568`
- Cluster execution sweep: `RAT-594`
- QA stability gate: `RAT-383`

Operational disposition for RAT-374:
- Keep this lane blocked/closed as duplicate for implementation purposes.
- Reopen only with fresh `RAT-374`-specific drift evidence observed after:
  1. `RAT-568` implementation is complete, and
  2. `RAT-383` QA gate is complete.

## Unblock Owner And Action
- Owner: control-plane lifecycle maintainer on `RAT-568`.
- Action: ship and verify canonical reopen guardrails in control-plane runtime, pass QA gate `RAT-383`, then execute cluster closeout sweep under `RAT-594`.
