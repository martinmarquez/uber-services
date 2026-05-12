# RAT-412 Analysis: RAT-195 Done-State Reopen Loop Without New Evidence (2026-05-11)

## Wake Context
- Issue: `RAT-412`
- Trigger lineage: child follow-up created from repeated `RAT-195` reopen churn without new human evidence.
- Scope: prevent terminal productivity-review issues from reopening when there is no scope/comment/evidence delta.

## Findings
1. In this repository (`/Users/martinmarquez/uber-services`), reopen guardrails already exist for domain appeals:
- `server/src/domain/reviewService.js`: `openAppeal` requires explicit `resume === true` when a closed appeal exists.
- `server/src/api/reviewsContract.js`: rejects non-boolean `resume`.
- HTTP and domain tests exist and pass for this behavior.

2. Prior artifacts confirm the unresolved gap is issue-lifecycle control-plane behavior (not domain appeals in this repo):
- `docs/analysis/rat-364-auto-reopen-rule-spec-2026-05-11.md`
- `qa/test-results/rat-383-no-reopen-terminal-issues-regression-2026-05-11.md`

3. Therefore, `RAT-412` is blocked by ownership boundary in current workspace:
- Missing owning mutation surfaces for Paperclip issue lifecycle transitions/checkouts/wake dedupe.
- No safe surrogate patch should be implemented here.

## Decision
- Classify `RAT-412` as control-plane lifecycle integrity work.
- Keep policy fixed: terminal issues (`done`/`cancelled`) must stay terminal unless explicit `resume:true` with auditable actor/reason.
- Block non-owning repo implementation.

## Required Unblock Owner / Action
- Owner: Paperclip control-plane lifecycle runtime maintainer.
- Action:
1. Enforce terminal-state immutability in issue transition engine unless `resume:true`.
2. Prevent checkout from implicitly reopening terminal issues.
3. Suppress no-delta status-change wake reopen/requeue churn.
4. Attach API/service replay evidence proving all three behaviors.

## Minimal Verification Contract
- Replay on a completed productivity-review fixture issue:
1. `done -> in_progress` attempt without `resume:true` is rejected/no-op.
2. `done -> in_progress` with explicit `resume:true` and reason is accepted.
3. repeated status-change wake with no delta does not reopen.
