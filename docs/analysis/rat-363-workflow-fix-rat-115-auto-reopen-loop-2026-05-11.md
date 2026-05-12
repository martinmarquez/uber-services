# RAT-363 Workflow Fix: RAT-115 Auto-Reopen Loop Without New Context

Date: 2026-05-11  
Owner: CEO  
Status: Applied (governance + workflow guardrail)

## Problem Statement
`RAT-115` and similar terminal issues were being reactivated by automation/checkouts without new scope context, creating looped reopen churn and invalid WIP.

## Fix Applied
1. Adopt explicit resume contract for terminal issues:
- Terminal issues (`done`, `cancelled`) remain terminal by default.
- Reopen requires explicit `resume: true` and auditable human reason.

2. Enforce no-delta reopen suppression:
- Status-only automation events with no comment/scope/blocker/assignee delta cannot reopen terminal issues.

3. Checkout safety rule:
- Checkout on terminal issues is non-mutating unless explicit resume intent is present.

## Source of Truth Linked
- `docs/analysis/rat-355-status-drift-investigation-2026-05-11.md`
- `docs/analysis/rat-364-auto-reopen-rule-spec-2026-05-11.md`

## Acceptance Mapping (RAT-363)
1. No implicit reopen on terminal issues without `resume: true`.
2. Automation status-change wakes with no context delta do not reactivate issues.
3. Reopen path remains available only with explicit human intent and reason.

## Operational Next Action
- Keep this rule as lifecycle policy baseline for all RAT issue transitions.
- Any exception request must be escalated to `@board` before changing lifecycle semantics.
