# RAT-20 — A/B Statistical Readout

Fecha de corrida: 2026-05-07  
Owner: Data Analyst  
Experimento: Ranking robusto (Control A vs Tratamiento B)  
Ventana analizada: 2026-05-06 a 2026-05-07 (dry-run offline + readiness QA)

## 1) Data Quality Checks
| Check | Resultado | Umbral | Estado |
|---|---:|---:|---|
| SRM p-value | N/A (sin stream productivo) | >= 0.001 | BLOCKED |
| Cobertura `search_impression` | N/A (sin stream productivo) | >= 99.5% | BLOCKED |
| Cobertura `booking_complete` | N/A (sin stream productivo) | >= 99.0% | BLOCKED |
| Duplicados de eventos | N/A (sin stream productivo) | <= 0.1% | BLOCKED |
| Integridad join sesion->booking | N/A (sin stream productivo) | >= 99.0% | BLOCKED |
| Reproducibilidad simulacion offline | `true` (double run exact match) | `true` | PASS |

## 2) Primary Metrics (Holm-Bonferroni)
Sin datos productivos A/B disponibles al corte.  
No se reportan p-values ni IC inferenciales porque no hay stream de exposicion/conversion validado para online decisioning.

| Metrica | Control | Tratamiento | Delta abs | Delta rel | IC 95% | p-value crudo | p-value ajustado | Decision |
|---|---:|---:|---:|---:|---|---:|---:|---|
| booking_conversion_rate | N/A | N/A | N/A | N/A | N/A | N/A | N/A | BLOCKED |
| completion_rate | N/A | N/A | N/A | N/A | N/A | N/A | N/A | BLOCKED |
| refund_claim_rate | N/A | N/A | N/A | N/A | N/A | N/A | N/A | BLOCKED |

## 3) Secondary Metrics
| Metrica | Control | Tratamiento | Delta rel | IC 95% | p-value |
|---|---:|---:|---:|---|---:|
| ctr_top5 | N/A | N/A | N/A | N/A | N/A |
| time_to_first_contact | N/A | N/A | N/A | N/A | N/A |
| repeat_provider_30d | N/A | N/A | N/A | N/A | N/A |

## 4) Guardrails
| Guardrail | Control | Tratamiento | Delta | Umbral | Estado |
|---|---:|---:|---:|---:|---|
| Latencia p95 feed | N/A | N/A | N/A | <= +5% | BLOCKED |
| Error rate API | N/A | N/A | N/A | <= +0.2 pp | BLOCKED |
| Fraud risk index | 0.55 (proxy offline: fraud_top20_share_naive) | 0.00 (proxy offline: fraud_top20_share_robust) | -0.55 | <= +0.1 sigma | PASS (offline proxy) |

## 5) Segment Cut (ciudad x categoria)
No disponible por falta de stream productivo instrumentado.

## 6) Sequential Monitoring Log (si aplica)
No aplica: experimento online no iniciado con calidad de muestra validada.

## 7) Evidencia complementaria (offline)
Fuente: `qa/test-results/rat-24-rat-10d-rerun-readout-2026-05-06.md`

- `ndcg10`: 0.6667 -> 0.8879 (mejora proxy offline)
- `ndcg20`: 0.6955 -> 0.8156 (mejora proxy offline)
- `regret10`: 1.0 -> 0.8 (mejora proxy offline)
- `fraud_top20_share`: 0.55 -> 0.0 (mejora proxy offline)
- `small_sample_gap_points`: 17.73 (señal de corrección de sesgo low-N)

Estas métricas son válidas para robustez algorítmica en simulación, pero no sustituyen inferencia causal online para gate de release.

## 8) Decision Gate
- Resultado final: `BLOCKED`
- Razon principal: no hay datos online instrumentados con calidad de muestra verificable (SRM/logging/funnel), por lo que no se puede ejecutar inferencia A/B de primarias según metodología RAT-20.
- Riesgos remanentes:
  - Riesgo de decisión falsa por muestra inválida si se habilita rollout sin instrumentación completa.
  - Riesgo operativo de latencia/error no medidos en condiciones reales.
- Recomendacion de rollout: `0%`

## 9) Blocker owner/action/ETA
- Owner unblock: Backend + Frontend Analytics (issue de instrumentación RAT-28 dependencias).
- Acción requerida:
  1. Emitir `experiment_assigned` y `review_conversion` con `experiment_id`, `variant`, `session_id`.
  2. Entregar extracto de 24h con split por variante y checks SRM/logging.
  3. Re-correr este readout con métricas primarias completas y p-values ajustados.
- ETA objetivo para rerun estadístico: 2026-05-09.

## 10) Sign-offs
- [x] CTO (productivity review RAT-77: follow-up execution required)
- [ ] PM/UX
- [x] Security (sin blocker de seguridad reportado en RAT-77)
