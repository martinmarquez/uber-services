# RAT-402 Issue-Blockers-Resolved Follow-up (2026-05-11)

Issue: `RAT-402` — Fix RAT-205 auto-reopen status churn after terminal close.
Wake: `issue_blockers_resolved`.

## Assessment
`RAT-402` itself is unblocked at ticket level, but the owning implementation lane is still not executable in this repository.

## Evidence Checked
1. Canonical implementation lane state:
- `docs/analysis/rat-568-comment-response-triage-2026-05-11.md`
- Status remains blocked on `RAT-428` in owning control-plane runtime path.

2. QA gate status:
- `qa/test-results/rat-383-no-reopen-terminal-issues-regression-2026-05-11.md`
- RAT-383 is conditional-pass in this workspace with residual risk and no authoritative control-plane replay artifact.

3. RAT-402 lane policy:
- `docs/analysis/rat-402-duplicate-lifecycle-lane-closure-2026-05-11.md`
- Reopen criteria still require: RAT-568 complete + RAT-383 complete + fresh RAT-205-specific drift evidence.

## Decision
Keep `RAT-402` as non-executing duplicate lane; no new local code mutation applied in this heartbeat.

## Unblock Owner / Action
- Owner: control-plane lifecycle maintainer (`RAT-568` / `RAT-428` owners).
- Action:
  1. Land control-plane `/api/issues` lifecycle patch (done->in_progress reopen guard with explicit scoped trigger).
  2. Attach before/after runtime replay evidence from owning repo.
  3. Complete QA gate with direct lifecycle transition coverage.
  4. Run duplicate closure sweep under `RAT-594`.

## Clear Next Action for RAT-402
Re-evaluate only after canonical evidence is posted; if fresh RAT-205-specific drift remains, reopen RAT-402 with that trace.
