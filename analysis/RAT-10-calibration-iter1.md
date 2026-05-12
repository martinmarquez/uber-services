# RAT-10 Calibration Sweep - Iteracion 1

Fecha: 2026-05-06  
Scope: `RAT-21`  
Baseline script: `analysis/rat10_simulation.py` (seed fija `42`)

## Objetivo
Calibrar hiperparametros del scoring robusto para mejorar calidad de top-ranking sin perder control anti-gaming.

Formula evaluada:
- `m` (prior Bayes)
- `k` (ritmo de saturacion en `F_volume`)
- `inc_w` (sensibilidad de incidente en `exp(-inc_w * incident_sev)`)

## Baseline (config actual)
- `m=25`, `k=20`, `inc_w=0.35`
- `tau_robust`: `0.1802`
- `ndcg10_robust`: `0.8593`
- `regret10_robust`: `0.90`
- `small_sample_gap_points`: `19.11`

## Barrido sintetico (top candidatos por objetivo compuesto)
Objetivo compuesto usado para desempate operativo:
- `0.55 * NDCG@10 + 0.25 * (1 - Regret@10) + 0.20 * max(Tau, 0)`

Top 5:
1. `m=15`, `k=12`, `inc_w=0.25` -> tau `0.2135`, ndcg10 `0.9055`, regret10 `0.80`, gap `16.51`
2. `m=15`, `k=12`, `inc_w=0.30` -> tau `0.2130`, ndcg10 `0.9055`, regret10 `0.80`, gap `16.51`
3. `m=15`, `k=12`, `inc_w=0.35` -> tau `0.2130`, ndcg10 `0.9055`, regret10 `0.80`, gap `16.51`
4. `m=20`, `k=12`, `inc_w=0.25` -> tau `0.1881`, ndcg10 `0.9049`, regret10 `0.80`, gap `16.41`
5. `m=20`, `k=12`, `inc_w=0.30` -> tau `0.1878`, ndcg10 `0.9049`, regret10 `0.80`, gap `16.41`

## Recomendacion Iteracion 1A
Adoptar candidate config:
- `m=15`
- `k=12`
- `inc_w=0.30` (misma calidad de ranking que 0.25 con mayor margen de seguridad ante incidentes)

Impacto vs baseline:
- `tau_robust`: `+0.0328` (de `0.1802` a `0.2130`)
- `ndcg10_robust`: `+0.0462` (de `0.8593` a `0.9055`)
- `regret10_robust`: `-0.10` (de `0.90` a `0.80`)
- `small_sample_gap_points`: `-2.60` (de `19.11` a `16.51`)

## Decision Gate / OKR Fit
- Mejora directa en calidad de top resultados y robustez anti-manipulacion (alineado a quality-trust KPI del ranking).
- Sin señales de riesgo de revenue/churn en esta fase offline; requiere validacion online con guardrails antes de escalar.

## Proximo paso recomendado
Ejecutar `RAT-10B` con validacion por cohortes (zona, antiguedad del proveedor, categoria) y stress-test de fairness para confirmar que la calibracion no introduce deboost estructural en segmentos de baja densidad.
