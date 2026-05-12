# RAT-363 Terminal Reopen Contract Check (2026-05-11)

## Objective
Provide an executable acceptance check that terminal issues do not reopen without explicit resume context.

## Command
```bash
tools/guardrails/check-rat-363-terminal-reopen-contract.sh
```

## Assertions Executed
1. Terminal reopen is blocked without `resume: true`.
2. Terminal reopen is allowed only with scoped explicit resume.
3. No-delta status-change wake on terminal issue is deduped.
4. Terminal issue cannot auto-resume from blocker-resolution wake.

## Result
- PASS (`RESULT=PASS`)
- Raw output: `qa/test-results/rat-363-terminal-reopen-contract-check-2026-05-11.txt`

## Acceptance Mapping
- Root cause class addressed: no-context automation reopen churn.
- Guard remains enforced: explicit human resume intent required.
- Terminal persistence preserved unless intentional resume context exists.
