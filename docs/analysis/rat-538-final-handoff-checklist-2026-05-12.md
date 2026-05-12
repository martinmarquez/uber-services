# RAT-538 Final Handoff Checklist (2026-05-12)

## Wake handled
- Trigger: `issue_children_completed`.
- Child outcome consumed: `RAT-1004` productivity review completed.

## Delivery bundle (already produced)
1. Guardrail ownership and repository-boundary evidence:
- `docs/analysis/rat-538-control-plane-guardrail-block-implicit-terminal-reopen-without-resume-2026-05-11.md`
2. State-correction sweep follow-up:
- `docs/analysis/rat-538-followup-state-correction-sweep-evidence-2026-05-11.md`
3. Runtime guardrail regression evidence packet:
- `docs/analysis/rat-538-runtime-guardrail-regression-evidence-2026-05-11.md`

## Acceptance checklist status
1. Negative regression (terminal + automation/checkout/no resume): `PASS`
- Evidence: `check-rat-363-terminal-reopen-contract.sh` output with `resume_required_for_terminal_reopen`.
2. Positive regression (explicit `resume:true` + actor + reason): `PASS`
- Evidence: `check-rat-363-terminal-reopen-contract.sh` output with `ok_explicit_resume`.
3. No-delta `issue_status_changed` dedupe: `PASS`
- Evidence: `check-rat-363-terminal-reopen-contract.sh` output with `dedupe_terminal_resume_wake_without_comment_delta`.
4. Guardrail regression suite breadth: `PASS`
- Evidence: `node --test tools/guardrails/issueLifecycleGuard.test.js` => `49/49 passed`.

## Blocker normalization and ownership
- Current hard blocker: authoritative control-plane `/api/issues` runtime is not present in `server/*` of this workspace.
- Unblock owner: `@CTO` / control-plane lifecycle runtime maintainer.
- Required unblock action:
1. Port/validate equivalent guardrail behavior in owning control-plane runtime.
2. Attach runtime-level replay/test output from that repository.
3. Confirm deploy/environment where lifecycle engine executes.

## Next action
- Await CTO/runtime-owner validation and authoritative runtime evidence to complete RAT-538 and unblock parent `RAT-465`.
