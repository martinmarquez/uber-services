# RAT-20 — A/B Statistical Readout Template

Fecha de corrida: YYYY-MM-DD
Owner: Data Analyst
Experimento: Ranking robusto (Control A vs Tratamiento B)
Ventana analizada: YYYY-MM-DD a YYYY-MM-DD

## 1) Data Quality Checks
| Check | Resultado | Umbral | Estado |
|---|---:|---:|---|
| SRM p-value |  | >= 0.001 |  |
| Cobertura `search_impression` |  | >= 99.5% |  |
| Cobertura `booking_complete` |  | >= 99.0% |  |
| Duplicados de eventos |  | <= 0.1% |  |
| Integridad join sesion->booking |  | >= 99.0% |  |

## 2) Primary Metrics (Holm-Bonferroni)
| Metrica | Control | Tratamiento | Delta abs | Delta rel | IC 95% | p-value crudo | p-value ajustado | Decision |
|---|---:|---:|---:|---:|---|---:|---:|---|
| booking_conversion_rate |  |  |  |  |  |  |  |  |
| completion_rate |  |  |  |  |  |  |  |  |
| refund_claim_rate |  |  |  |  |  |  |  |  |

Regla minima:
- Exito: >=2 de 3 primarias con mejora significativa post-ajuste.
- `refund_claim_rate` no puede empeorar significativamente.

## 3) Secondary Metrics
| Metrica | Control | Tratamiento | Delta rel | IC 95% | p-value |
|---|---:|---:|---:|---|---:|
| ctr_top5 |  |  |  |  |  |
| time_to_first_contact |  |  |  |  |  |
| repeat_provider_30d |  |  |  |  |  |

## 4) Guardrails
| Guardrail | Control | Tratamiento | Delta | Umbral | Estado |
|---|---:|---:|---:|---:|---|
| Latencia p95 feed |  |  |  | <= +5% |  |
| Error rate API |  |  |  | <= +0.2 pp |  |
| Fraud risk index |  |  |  | <= +0.1 sigma |  |

## 5) Segment Cut (ciudad x categoria)
Completar tabla para top ciudades/categorias por volumen.

| Segmento | BCR delta rel | CR delta rel | RCR delta rel | Observacion |
|---|---:|---:|---:|---|
|  |  |  |  |  |

## 6) Sequential Monitoring Log (si aplica)
| Corte | Fecha | Regla Pocock | Estado |
|---|---|---|---|
| 1 |  |  |  |
| 2 |  |  |  |
| 3 |  |  |  |

## 7) Decision Gate
- Resultado final: `PASS` / `BLOCKED`
- Razon principal:
- Riesgos remanentes:
- Recomendacion de rollout: `0%` / `10%` / `50%` / `100%`

## 8) Sign-offs
- [ ] CTO
- [ ] PM/UX
- [ ] Security
