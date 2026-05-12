# RAT-310 — Parametrizacion anti-gaming v1 + governance

Fecha: 2026-05-10
Owner: CTO
Estado: Aprobado para implementacion v1

## 1) Tabla versionada v1 por mercado

`threshold_version`: `anti_gaming_v1_2026-05-10`
`effective_from`: `2026-05-13 00:00:00 America/Argentina/Buenos_Aires`

| market | burst_window_hours | burst_count_threshold_pctl | max_user_contribution_30d | risk_deboost_cap |
| --- | ---: | ---: | ---: | ---: |
| AR-CABA | 24 | 99.5 | 0.25 | 0.45 |
| AR-AMBA | 24 | 99.3 | 0.28 | 0.50 |
| AR-INTERIOR | 48 | 99.0 | 0.30 | 0.55 |

Notas:
- `burst_count_threshold_pctl` se calcula por mercado sobre distribucion movil de 30 dias de eventos elegibles.
- `max_user_contribution_30d` limita el peso maximo de una sola cuenta sobre el score agregado de un prestador en ventana de 30 dias.
- `risk_deboost_cap` limita la reduccion maxima de ranking por riesgo para evitar colapsos por senales aisladas.

## 2) Regla de cambio y trazabilidad (governance)

Owners:
- Owner operativo: Trust & Safety (Security Engineer on-call).
- Co-owner tecnico: Data/ML Scoring.
- Aprobador final: CTO.

Politica de cambios:
1. Toda modificacion debe crear nuevo `threshold_version` (sin editar retroactivamente versiones previas).
2. Requiere evidencia de impacto en FP/FN sobre ventana minima de 14 dias (shadow o canary) por mercado.
3. Requiere aprobacion dual Security + Data/ML y aprobacion final CTO.
4. Debe comunicarse en issue RAT correspondiente y en changelog interno antes de `effective_from`.
5. Rollback definido al version anterior dentro de 60 minutos si se rompe guardrail critico.

Trazabilidad minima obligatoria por cambio:
- `changed_by`, `approved_by`, `change_reason`, `evidence_link`, `effective_from`, `rollback_version`.

## 3) Guardrails FP/FN v1

Guardrails de falsos positivos (FP):
- Appeal overturn rate (`no_recomendada`/`en_revision`) <= 12% semanal por mercado.
- Si supera 12% por 2 semanas consecutivas: congelar ajustes agresivos y abrir recalibracion.

Guardrails de falsos negativos (FN):
- Fraud-confirmed leakage en reseñas publicadas <= 2.0% semanal por mercado.
- Si supera 2.0% por 2 semanas consecutivas: endurecer thresholds y activar muestreo manual reforzado.

Guardrails de estabilidad operativa:
- Share de reseñas en `en_revision` <= 8% semanal por mercado.
- P95 tiempo a decision de moderacion <= 24h.

## 4) Cadencia de revision

- Revision quincenal fija de thresholds por mercado.
- Revision extraordinaria en <24h ante incidente de gaming coordinado.
- Toda revision genera acta en issue y actualiza ADR con decision nueva (no overwrite).
