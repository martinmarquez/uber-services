# RAT-738 Control-Plane Apply Runbook (2026-05-11)

Purpose: execute the 20 blockedByIssueIds writes required by RAT-738 acceptance in the control-plane runtime owner repo.

## Input payload
- `docs/analysis/rat-738-control-plane-mutation-payload-2026-05-11.json`

## Apply steps (control-plane owner)
1. For each item in `mutations`, patch target issue by identifier with `blockedByIssueIds`.
2. Keep status unchanged (`blocked`) while applying edges.
3. Reject any mutation that would create a cycle; record the rejected item and reason.

## Minimum verification gate
1. Edge-write coverage: 20/20 applied, or explicit rejected-list with reasons.
2. Cycle check: `0` cycles introduced.
3. RAT-731 comment posted with:
- updated issue links,
- applied count,
- rejected count and reasons,
- proof artifact links.

## RAT-738 completion rule
- RAT-738 may move from `blocked` only when control-plane owner posts the above verification in RAT-731 and links back to RAT-738.
