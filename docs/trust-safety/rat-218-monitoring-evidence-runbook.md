# RAT-218 Monitoring Evidence Runbook (24h)

Date: 2026-05-09
Owner: Security / Platform

## Objective

Produce closure-ready 24h monitoring evidence for `AUTHENTICATION_ERROR` split by `details.code`.

## Input

- NDJSON log export for the 24h window after enforcement (staging and production separately).
- Each line should include either:
  - `error.code` + `error.details.code`, or
  - `payload.error.code` + `payload.error.details.code`

## Command

```bash
node tools/guardrails/actor-signing-monitoring-summary.js <ndjson_log_file>
```

## Output

JSON summary:
- `totalAuthErrors`
- `breakdown.actor_signature_required`
- `breakdown.invalid_actor_signature`
- `breakdown.actor_signature_expired`
- `breakdown.invalid_actor_timestamp`
- `breakdown.other_authentication_error`

## Evidence Attachment

Paste summaries into:
- `qa/test-results/rat-218-actor-signing-rollout-evidence-template.md`

Required interpretation:
- confirm expected signature rejection paths are active
- identify spikes/regressions and follow-up actions

