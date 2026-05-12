# RAT-363 Lifecycle Guardrail Wiring (2026-05-11)

## Objective
Make terminal-state immutability enforcement executable through standard project scripts.

## Changes Applied
1. Added `npm` guard scripts in `package.json`:
- `guard:rat-363`
- `guard:lifecycle-terminal` (alias)

2. Added lifecycle guardrails usage note in `server/README.md`.

## Execution Proof
Command:
```bash
npm run guard:rat-363
```

Result:
- PASS (`RESULT=PASS`)
- Raw output: `qa/test-results/rat-363-npm-guardrail-run-2026-05-11.txt`

## Operational Impact
Terminal-state reopen protection is now callable via a stable npm interface for repeatable enforcement in local checks and CI wiring.
