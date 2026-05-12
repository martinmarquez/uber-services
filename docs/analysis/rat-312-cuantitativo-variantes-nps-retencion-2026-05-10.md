# RAT-312 — Cálculo cuantitativo por variante + NPS + retención (2026-05-10)

Issue: [RAT-312](/RAT/issues/RAT-312)  
Parent: [RAT-30](/RAT/issues/RAT-30)

## Resumen ejecutivo
No hay evidencia cuantitativa online suficiente para declarar impacto causal por variante en Iteración 1.
La lectura estadística permanece en `BLOCKED/HOLD` por falta de extracto de telemetría productiva de 24h con validación de muestra por variante.

## Fuentes usadas
- `qa/test-results/rat-20-ab-test-statistical-readout-2026-05-07.md`
- `qa/test-results/rat-28-ab-instrumentation-qa-readout-2026-05-10.md`
- `docs/analysis/rat-306-rat-28-1-24h-data-extract-status-2026-05-10.md`

## Gate de muestra por variante (`n >= 100`)
Estado: `BLOCKED`

- `RAT-28` confirma instrumentación implementada (`experiment_assigned`, `review_conversion`), pero sin extracto productivo adjunto para conteos por variante.
- Sin conteos observados por variante, no se puede verificar `n_control >= 100` y `n_treatment >= 100`.

## Tabla final (cifras y supuestos explícitos)

| Bloque | Métrica | Control | Treatment | Delta | Estado | Supuesto/nota |
|---|---|---:|---:|---:|---|---|
| Volumen | `review_conversion_count` | N/A | N/A | N/A | BLOCKED | No hay extracto 24h de producción por variante |
| Calidad | `verified_review_rate` | N/A | N/A | N/A | BLOCKED | Sin tabla exposure->conversion productiva |
| NPS | `nps_mean` / `nps_respondent_rate` | N/A | N/A | N/A | BLOCKED | No hay stream NPS por `experiment_id`/`variant` |
| Retención temprana | `d7_repeat_rate` (cohorte) | N/A | N/A | N/A | BLOCKED | No hay cohorte vinculada a variante |
| Gate muestra | `n por variante` | N/A | N/A | N/A | BLOCKED | Requisito mínimo `>=100` por variante no verificable |

## Evidencia cuantitativa disponible (solo proxy offline, no causal online)
Desde `RAT-20` (simulación offline):

- `ndcg10`: 0.6667 -> 0.8879
- `ndcg20`: 0.6955 -> 0.8156
- `regret10`: 1.0 -> 0.8
- `fraud_top20_share`: 0.55 -> 0.0

Interpretación: mejora de robustez algorítmica en entorno simulado. Estas cifras no sustituyen inferencia causal online ni cubren NPS/retención por variante.

## Conclusión estadística
- Resultado final de lectura cuantitativa Iteración 1: `INCONCLUSO (BLOCKED por datos)`.
- No corresponde declarar variante ganadora/perdedora.
- Recomendación de rollout basada en evidencia actual: `0%`.

## Acción de desbloqueo
Owner: CTO / Data Platform

1. Inyectar credenciales warehouse en runtime.
2. Ejecutar `analysis/sql/rat-306-rat-28-1-ab-qa-24h-extract.sql`.
3. Adjuntar tabla de resultados (conteos por variante, SRM, duplicados, integridad de funnel).
4. Recalcular tabla de impacto + NPS + retención con inferencia estadística.
