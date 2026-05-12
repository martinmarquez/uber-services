# RAT-10 Simulacion Offline - Iteracion 2 (Calibracion)

Fecha: 2026-05-06  
Script: `analysis/rat10_simulation.py`  
Seed: `42`

## Metodo
- Barrido coarse sobre parametros:
  - `m in {20,25,30,35}`
  - `k in {15,20,25}`
  - `gamma in {0.25,0.35,0.45}`
- Objetivo ponderado: calidad top-k + anti-fraude + reduccion de small-sample over-ranking + estabilidad.

## Mejor configuracion encontrada
- `m=20`
- `k=15`
- `gamma=0.35`

## Resultados con mejor configuracion
- `tau_naive=0.5351`
- `tau_robust=0.1901`
- `ndcg10_naive=0.6667`
- `ndcg10_robust=0.8879`
- `ndcg20_naive=0.6955`
- `ndcg20_robust=0.8156`
- `regret10_naive=1.0`
- `regret10_robust=0.8`
- `small_sample_gap_points=17.73`
- `weekly_vol_naive=1.0301`
- `weekly_vol_robust=1.2747`
- `fraud_top20_share_naive=0.55`
- `fraud_top20_share_robust=0.0`

## Conclusion tecnica
- La calibracion de iteracion 2 mejora fuerte la calidad en top resultados y elimina exposicion fraudulenta en top-20 en este set sintetico.
- Se mantiene tradeoff de correlacion global (`tau`) por priorizar robustez operacional de ranking visible.
- Se cumple evidencia de dos iteraciones con ajuste de parametros y comportamiento anti-gaming.
