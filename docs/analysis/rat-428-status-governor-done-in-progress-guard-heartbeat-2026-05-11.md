# RAT-428 Heartbeat: Guard `done -> in_progress` Without New Scoped Input (2026-05-11)

Issue: `RAT-428` — Fix issue status governor to prevent `done -> in_progress` auto-flip without new scoped input.

## Wake Handling
- Wake reason: `issue_assigned`.
- Wake payload included no new human comments (`pending comments: 0/0`), so execution proceeded directly from the inline scope.

## Wake Follow-Up (2026-05-11T04:09:09Z)
- New CTO triage comment on `RAT-178` confirms security fix remains complete (`commit 7894af1`) and assigns status-governor follow-up to `RAT-428`.
- Heartbeat action taken: revalidated implementation surface in this repo before attempting any mutation.
- Verification command rerun:
  - `bash tools/guardrails/check-rat-413-control-plane-runtime-surface.sh`
  - Result: `RESULT=BLOCKED_WRONG_REPO`
  - Detail: `No control-plane issue lifecycle runtime signatures found in server/*`
- Deployment strategy reference check:
  - `DEPLOY_CONFIG.md` is still absent from the assigned instructions directory; only `AGENTS.md`, `HEARTBEAT.md`, `SOUL.md`, and `TOOLS.md` are present.

## What Was Done
1. Searched executable code in this workspace for the issue status governor / control-plane lifecycle runtime (`/api/issues`, heartbeat checkout mutation paths, issue transition handlers).
2. Ran the runtime-surface guardrail check:
   - Command: `bash tools/guardrails/check-rat-413-control-plane-runtime-surface.sh`
   - Result: `RESULT=BLOCKED_WRONG_REPO`
   - Detail: `No control-plane issue lifecycle runtime signatures found in server/*`
3. Confirmed this repository contains product-domain services and analysis artifacts, but not the owning control-plane module where `done -> in_progress` governor logic can be patched.

## Blocker
Implementation of the requested governor fix is blocked in this workspace because the owning control-plane lifecycle runtime is not present.

## Unblock Owner / Action
- Owner: Paperclip control-plane lifecycle runtime maintainer.
- Required action:
  1. Patch issue status governor in the control-plane repository so `done -> in_progress` is disallowed unless explicit scoped resume input is present.
  2. Add regression tests covering:
     - `done -> in_progress` with no new scoped input => no-op/rejected.
     - explicit scoped resume input => allowed transition.
  3. Attach before/after replay evidence from the owning runtime.

## Additional Context
- Referenced instruction file `DEPLOY_CONFIG.md` was not present at:
  `/Users/martinmarquez/.paperclip/instances/default/companies/ecee6d4c-08bc-4e67-af62-5f6eb884f553/agents/8dd474b9-148d-4918-9f17-34a47b499e08/instructions/DEPLOY_CONFIG.md`
