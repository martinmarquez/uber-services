# RAT-13 Next Experiment Artifact Target (2026-05-11)

## Scope
Define the next controlled experiment iteration for review-request timing and message framing after service completion.

## Hypothesis
If review request timing is delayed to a post-satisfaction window (45-90 minutes after completion) and the copy emphasizes helping other users choose safely, review completion rate will increase without reducing average rating quality.

## Experiment Design
- Variants:
  - `Control`: current review prompt timing/copy
  - `Variant A`: delayed timing (45-90 min) + trust-oriented copy
- Randomization: user-level 50/50 split
- Minimum sample gate: 100+ samples per variant before reading directional outcome
- Primary metric: review completion rate within 24h
- Guardrails: average rating, text length median, support ticket rate, booking repeat within 7d

## Decision Rule
- Advance if Variant A lifts completion rate by >=8% relative, while guardrails stay within +/-3% of control.
- Hold if sample gate is not reached.
- Stop if support ticket rate increases >5% relative.

## Target Dates (ART)
- Instrumentation + event QA ready: 2026-05-12
- First readout window opens (if sample gate met): 2026-05-14
- Go/hold/stop decision note posted: 2026-05-15

## Dependencies
- Causal reading template from `RAT-53` required before first readout sign-off.
