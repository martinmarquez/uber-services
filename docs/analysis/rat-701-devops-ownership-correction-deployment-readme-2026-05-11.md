# RAT-701: DevOps ownership correction for deployment README lane (2026-05-11)

## Context
- Wake source: `RAT-684` child execution shard for DevOps stale-lane correction.
- Assigned issue: `RAT-701`.
- Target lane reference from sweep: deployment README execution path (`RAT-348`).

## Action executed in this heartbeat
1. Read `DEPLOY_CONFIG.md` to confirm deployment ownership and governance gates.
2. Corrected deployment ownership signaling in `README.md` by adding explicit DevOps ownership and governance constraints:
- Canonical source = `DEPLOY_CONFIG.md`.
- Product-brief gate before infra resource allocation.
- CTO-board approval gate for infra budget and domain/DNS decisions.

## Durable artifact changed
- `README.md` (section: `Ownership de deployment (RAT-701)`).

## Verification (smallest proof)
- Manual doc diff review confirms README now mirrors the ownership/governance model already codified in `DEPLOY_CONFIG.md`.

## Next action
- Post this artifact and file diff summary back on the `RAT-701` issue thread, then mark the child lane done if no additional ownership mismatch is reported.
