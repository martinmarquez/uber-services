# RAT-457 Investigation: repeated status drift reopening closed RAT-188 (2026-05-11)

## Scope

Determine why [RAT-188](/RAT/issues/RAT-188) repeatedly reopens after closure and define durable remediation.

## Evidence

1. Direct activity trace for `RAT-188` confirms repeated terminal drift without new contradictory proof:
- `2026-05-11T03:32:49.802Z`: `done -> todo`
- `2026-05-11T03:55:46.123Z`: `done -> todo`
- `2026-05-11T04:05:25.632Z`: `done -> todo`
- `2026-05-11T04:12:57.881Z`: `done -> todo`
2. These flips are followed by manual reconciliation back to `done` by CEO comments confirming acceptance remains valid.
3. Prior lineage on the same issue shows automation reopening transitions tied to sweep behavior:
- `2026-05-10T01:09:38.716Z`: `blocked -> in_progress`
- Paired comment: `Auto-unblocked in RAT-41 sweep: deps=0.`
4. No fresh technical evidence was added that invalidates RAT-188 acceptance. Latest accepted proof remains non-interactive CTO-shell `psql` success, already recorded on RAT-188 thread.

## Conclusion

`RAT-457` is not a domain-code defect in this repository. It is the known Paperclip lifecycle integrity class: terminal issue states are being rewritten by automation without explicit resume intent.

## Permanent fix required in owning runtime

1. Enforce terminal immutability in issue transitions:
- `done`/`cancelled` cannot move to active states unless payload includes explicit `resume: true` plus actor/reason provenance.
2. Make sweep/checkout/status-change paths non-mutating for terminal issues when resume intent is absent.
3. Add no-delta dedupe so repeated wakes without scope/comment/blocker/assignment delta cannot requeue/reopen terminal issues.
4. Add regression replay cases for RAT-188-equivalent flow proving:
- terminal + automation/no-resume => no reopen,
- terminal + checkout/no-resume => no mutation,
- explicit `resume:true` + reason => reopen allowed and audited.

## Workspace boundary

This workspace (`/Users/martinmarquez/uber-services`) does not contain the owning Paperclip control-plane lifecycle mutation runtime (`/api/issues` transition engine and wake/sweep handlers), so the durable code fix cannot be applied here.
