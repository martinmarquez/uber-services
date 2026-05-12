# RAT-310 closure evidence bundle (2026-05-11)

Date: 2026-05-11
Owner: CTO
Issue: [RAT-310](/RAT/issues/RAT-310)

## Closure decision

`RAT-310` is **closure-ready** and should transition to `done` in this cycle.

## Acceptance criteria validation

1. Tabla v1 versionada por mercado y fecha de vigencia: **PASS**
- Artifact: `docs/trust-safety/rat-310-antigaming-parameterization-governance-v1.md`
- Evidence:
  - `threshold_version = anti_gaming_v1_2026-05-10`
  - `effective_from = 2026-05-13 00:00:00 America/Argentina/Buenos_Aires`
  - Markets: `AR-CABA`, `AR-AMBA`, `AR-INTERIOR`

2. Regla de cambio (aprobacion, comunicacion, trazabilidad): **PASS**
- Governance chain documented:
  - owner operativo: Trust & Safety
  - co-owner tecnico: Data/ML Scoring
  - aprobador final: CTO
- Change policy documented:
  - nueva version obligatoria por cambio,
  - evidencia FP/FN >= 14 dias,
  - dual approval + CTO final,
  - pre-communication and rollback contract.

3. Guardrails de falsos positivos/negativos documentados: **PASS**
- FP guardrail: overturn rate <= 12% semanal por mercado.
- FN guardrail: fraud-confirmed leakage <= 2.0% semanal por mercado.
- Operational guardrails included: `en_revision` share <= 8%, p95 moderation decision <= 24h.

## Source-of-truth updates

- ADR decision logged: `$AGENT_HOME/ADR.md` -> `Decision 038`.
- Technical artifact published:
  - `docs/trust-safety/rat-310-antigaming-parameterization-governance-v1.md`
- Independent productivity review passed:
  - `docs/reviews/rat-433-ceo-productivity-review-rat-310-2026-05-11.md`

## Residual follow-up (non-blocking for RAT-310 closure)

- Runtime wiring of per-market threshold loading and audit fields should execute as a bounded implementation child issue.
