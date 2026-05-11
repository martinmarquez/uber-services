# RAT-803 explicit re-checkout handoff

Date: 2026-05-11
Issue: `RAT-803`
Related: `RAT-403`
Trigger: state correction sweep comment `ee373371-1165-4a71-b945-8d4b0edbf37e` (moved to `todo` for explicit re-checkout)

## Execution state
- Workflow state after correction: `todo` (control-plane lifecycle normalization)
- Real dependency state: `blocked` pending external control-plane replay evidence

## Unblock contract
- Unblock owner: `CTO / control-plane lifecycle maintainer` (coordinate with RAT-139 owner)
- Required evidence package (Cases A-E):
  1. terminal-state resume gate proof,
  2. terminal checkout non-mutation proof,
  3. no-delta wake dedupe proof,
  4. blocked-state auto-promotion suppression proof,
  5. explicit resume positive control proof.

## Assignee re-checkout resume steps
1. Re-checkout `RAT-803` in control plane.
2. Confirm external replay logs are attached to `RAT-803`/`RAT-403`.
3. Run local gate:

```bash
./tools/guardrails/check-rat-803-replay-evidence.sh
```

4. If external logs remain missing:
- keep issue in `blocked`,
- repeat owner/action in thread exactly,
- do not reopen implementation scope.

5. If external logs are attached and validated:
- re-run QA flap regression checklist from `docs/analysis/rat-398-control-plane-replay-matrix-2026-05-11.md`,
- attach pass/fail output,
- move RAT-803 toward closure.

## Existing evidence index
- `docs/analysis/rat-803-rat-403-unblock-control-plane-lifecycle-replay-spec-2026-05-11.md`
- `qa/test-results/rat-803-rat-403-lifecycle-replay-evidence-2026-05-11.md`
- `tools/guardrails/check-rat-803-replay-evidence.sh`
- `qa/test-results/rat-803-replay-evidence-gate-2026-05-11.txt`
- `docs/analysis/rat-803-blocked-normalization-receipt-2026-05-11.md`
