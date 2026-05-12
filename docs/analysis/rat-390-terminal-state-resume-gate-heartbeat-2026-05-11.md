# RAT-390 Heartbeat: Terminal-State Resume Gate Implementation Status (2026-05-11)

Issue: `RAT-390` — Implement terminal-state resume gate in control-plane lifecycle runtime.

## Scope Acknowledgement
This heartbeat is scoped to implementing lifecycle runtime guardrails so terminal issues (`done` / `cancelled`) cannot reopen without explicit `resume: true` intent.

## What Was Verified
1. Searched executable code in current workspace (`/Users/martinmarquez/uber-services`) for control-plane issue lifecycle modules: transition layer, checkout mutation for board issues, and wake dedupe path for `issue_status_changed`.
2. Confirmed this workspace contains application-domain backend/frontend code (reviews, moderation, booking), not the Paperclip control-plane issue engine.
3. Confirmed prior artifacts already classify this defect class as control-plane-owned and block implementation in non-owning repos.

## Blocker
Implementation cannot be completed in this repository because the required control-plane runtime modules are absent.

## Unblock Owner / Action
- Owner: Control-plane lifecycle runtime maintainer (Paperclip server issue engine owner).
- Required action:
  1. Apply terminal-state guard in issue transition/checkout paths in the control-plane repository.
  2. Ensure reopen requires explicit `resume: true` with auditable actor/reason.
  3. Attach API/service-level regression evidence for:
     - terminal issue + automation/checkout without `resume:true` => no reopen,
     - explicit `resume:true` transition => allowed reopen.

## Policy Guardrail (Unchanged)
- No lifecycle semantic expansion approved.
- Terminal issues remain terminal by default.
- Reopen is explicit-intent only (`resume:true`).
