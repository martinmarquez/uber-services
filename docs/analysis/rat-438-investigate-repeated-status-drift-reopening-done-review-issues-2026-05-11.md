# RAT-438 Investigation: repeated status drift reopening done review issues (2026-05-11)

## Scope
Issue: [RAT-438](/RAT/issues/RAT-438)

Objective: investigate repeated `done -> in_progress` drift on review issues and define durable remediation.

## Wake context acknowledged
- Wake reason: `issue_status_changed`
- Pending comments: `0/0` (no new human scope delta in this wake)
- Current issue state on wake: `in_progress`

## Findings
1. This wake matches the existing lifecycle integrity defect family already observed across multiple review tickets: terminal issues are reactivated without explicit resume intent.
2. In this workspace (`/Users/martinmarquez/uber-services`), there is no owning Paperclip control-plane lifecycle mutation runtime (`/api/issues` transition engine, checkout reopen gate, status-change no-delta dedupe path) to patch directly.
3. Repeated reopen drift will continue until control-plane guardrails are enforced in the owning runtime.

## Required runtime guardrails (owner outside this repo)
1. Terminal-state immutability: `done`/`cancelled` cannot reopen unless explicit `resume:true` with auditable actor/reason.
2. Checkout non-mutation: checkout cannot implicitly reopen terminal issues without explicit resume intent.
3. No-delta wake dedupe: suppress `issue_status_changed` auto-wakes when no scope/comment/blocker/assignee delta exists.
4. Regression replay: prove repeated wake+checkout sequences keep reopen count at `0` unless `resume:true` is present.

## Decision
Set [RAT-438](/RAT/issues/RAT-438) to `blocked` pending runtime-owner remediation and replay evidence.

## Unblock owner and action
- Owner: `@board` / control-plane lifecycle runtime maintainer.
- Action: implement and deploy the four runtime guardrails above, then attach replay evidence showing no implicit reopen.

## Heartbeat addendum (2026-05-11T04:36:00-03:00)
- Rechecked current checkout paths against prior continuation summary references.
- Confirmed `server/src/routes/issues.ts` and `server/src/__tests__/issue-comment-reopen-routes.test.ts` are absent in `/Users/martinmarquez/uber-services`.
- Conclusion: deterministic code fix for reopen drift must be landed in the owning control-plane runtime repository; this workspace can only maintain investigation and escalation artifacts.
- Block status remains valid until owner attaches replay evidence proving no implicit reopen without `resume:true`.

## Resume delta addendum (2026-05-11T05:24:00-03:00, issue_reopened_via_comment)
- New wake comment `0fc1d97b-c22e-4292-8532-f5f40da192ae` reclassified RAT-438 as Wave-1 stale sweep duplicate lane.
- Canonical remediation routing is now explicit:
  - implementation lane: `RAT-568`,
  - cluster sweep tracking: `RAT-594`,
  - QA completion gate: `RAT-383`.
- Disposition for RAT-438: keep closed/blocked as duplicate governance lane; do not run parallel implementation in this repo.
- Reopen policy: reopen only with fresh RAT-438-specific drift evidence after RAT-568 implementation and RAT-383 QA completion.
