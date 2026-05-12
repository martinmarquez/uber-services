# RAT-10 Simulacion Offline - Iteracion 1

Fecha: 2026-05-06  
Script: `analysis/rat10_simulation.py`  
Seed: `42`

## Objetivo
Validar comportamiento inicial del score robusto ante:
- inflation por muestras pequenas
- burst fraud
- incidentes severos

## Cambio aplicado tras primer run
El primer intento con `F_volume = 1 - exp(-v/k)` penalizo demasiado low-volume y degrado la correlacion de ranking.

Ajuste iteracion 1:
- `F_volume` paso a banda acotada `0.7 + 0.3*(1-exp(-v/k))`
- Objetivo: mantener regularizacion por evidencia sin colapsar orden relativo entre proveedores honestos.

## Resultados (post-ajuste)
- `tau_naive`: `0.5351`
- `tau_robust`: `0.1802`
- `ndcg10_naive`: `0.6667`
- `ndcg10_robust`: `0.8593`
- `ndcg20_naive`: `0.6955`
- `ndcg20_robust`: `0.7926`
- `regret10_naive`: `1.0`
- `regret10_robust`: `0.9`
- `small_sample_gap_points` (naive - robust): `19.11`
- `weekly_vol_naive`: `1.0114`
- `weekly_vol_robust`: `1.1730`
- `fraud_top20_share_naive`: `0.55`
- `fraud_top20_share_robust`: `0.00`

## Lectura tecnica
- El score robusto mejora ranking top-k (`NDCG@10`) y reduce sobre-ranking por muestra chica.
- En `NDCG@20`, robust tambien supera a naive (`0.7926` vs `0.6955`), aunque con menor margen que en `NDCG@10`.
- Kendall tau global cae frente a naive, lo que sugiere que el sistema robusto prioriza confiabilidad/seguridad para top positions en detrimento de orden global puro.
- Sensibilidad a fraude es alta y efectiva: 55% del top-20 naive queda contaminado por cohorte fraudulenta, mientras robust lo reduce a 0%.
- Volatilidad semanal robusta queda levemente por encima de naive (`1.1730` vs `1.0114`), señal de que la capa de confiabilidad necesita amortiguacion temporal adicional.
- Para objetivo de marketplace (quality de top resultados + anti-gaming), la direccion es razonable, pero requiere iteracion 2 para balancear correlacion global.

## Riesgos y ajustes propuestos (iteracion 2)
1. Separar estrictamente factor de display/certeza del factor de orden para mejorar tau global.
2. Explorar `m` por categoria (servicios alta varianza vs baja varianza).
3. Reducir sensibilidad de `F_incident` en categorias con incidentes administrativos no criticos.
4. Medir fairness por zona/segmento para evitar deboost estructural a nuevos proveedores de areas de baja densidad.

## Conclusion
Iteracion 1 deja una formula funcional y robusta contra small-sample gaming, con evidencia de mejora en top-k y reduccion parcial de regret. Se requiere iteracion 2 para optimizar tradeoff entre precision global y robustez operacional.
