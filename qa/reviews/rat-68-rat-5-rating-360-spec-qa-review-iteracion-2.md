# RAT-68 / RAT-5 - QA Review del spec de rating 360 (Iteracion 2)

Fecha: 2026-05-07
Issue: RAT-68
Spec revisado: `RAT-10-ranking-robusto.md`

## Decision de gate
PASS de QA de spec para implementacion, con seguimiento no bloqueante de trazabilidad de seed.

## Verificacion de hallazgos de Iteracion 1

1. Escala de `F_recency` corregida y testeable
- Estado: RESUELTO.
- Evidencia: se introduce `R_rec_norm = (R_rec - 1) / 4` y `F_recency = 0.85 + 0.15 * R_rec_norm`.
- Resultado QA: rango exacto validable `0.85..1.00` en bordes `R_rec=1` y `R_rec=5`.

2. Agregacion de incidentes formalizada
- Estado: RESUELTO.
- Evidencia: `I_raw = sum(sev_j * d_j)`, decay con half-life 90 dias, ventana 180 dias, `I_sev=min(3.0, I_raw)`.
- Resultado QA: expected deterministico para casos con incidentes multiples.

3. Contrato low-N y formato publico definidos
- Estado: RESUELTO.
- Evidencia: segmentos exactos `[0,5)`, `[5,15)`, `[15,40)`, `[40,+inf)`, publicacion solo si `v_eff>=5`, precision 1 decimal, redondeo half-away-from-zero, campos `displayScore` y `confidenceBadge`.
- Resultado QA: desaparece ambiguedad FE/BE en fronteras.

## Cobertura de testabilidad validada en spec

- Guardrails anti-gaming versionados en `ranking_guardrails.v1` con thresholds y duracion de deboost.
- Baseline formal versionado (`baseline_naive_avg_v1`) y metadata obligatoria de corrida (`baseline_version`, `dataset_snapshot`, `seed`, `code_commit`).
- Criterios de aceptacion de producto para QA de spec explicitos y verificables.

## Riesgo remanente (no bloqueante)

1. Trazabilidad de seed inconsistente entre secciones
- Observacion: calibracion menciona "seed 42" mientras baseline oficial fija `20260506`.
- Riesgo: confusion en lectura de evidencia entre calibracion y gate de reproducibilidad.
- Recomendacion: explicitar en spec que "seed 42" aplica solo a calibracion exploratoria y que acceptance gate usa `20260506`.

## Gate de salida QA (spec)

- Estado: PASS.
- Condicion: mantener sincronizada la matriz `RR-01..RR-12` en `qa/test-plans/ratings-reviews-test-matrix.md` durante implementacion.

## Siguiente accion QA

- Convertir `RR-01..RR-12` en casos automatizados (unit/property/contract) en cuanto backend publique modulo de scoring y contrato API de `displayScore/confidenceBadge`.
