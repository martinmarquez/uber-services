# RAT-27 - QA Review del spec de rating 360 (Iteracion 1)

Fecha: 2026-05-06
Issue: RAT-27
Spec revisado: `RAT-10-ranking-robusto.md`

## Decision de gate
BLOCKED para implementacion hasta corregir hallazgos criticos de testabilidad y consistencia.

## Hallazgos criticos (deben resolverse)

1. Escala inconsistente en factor de recencia
- Ubicacion: seccion `3) Factor de recencia (F_recency)`.
- Problema: `R_rec` se define como promedio exponencial de `r_i` (escala 1..5), pero luego `F_recency = 0.85 + 0.15 * (R_rec/5)` hace que el minimo teorico sea `0.88` (si `R_rec=1`) y no `0.85` como indica la banda documentada.
- Riesgo QA: pruebas de borde no pueden validar el rango esperado publicado (0.85..1.00).
- Criterio de correccion: alinear formula y banda (ejemplo: normalizar rating a 0..1 antes de mapear, o corregir banda declarada a 0.88..1.00).

2. Ambiguedad de severidad agregada de incidentes
- Ubicacion: seccion `5) Severidad de incidentes (F_incident)`.
- Problema: `I_sev` se describe como agregada rolling 180 dias, pero no define funcion de agregacion (suma, maximo, EWMA, cap) ni limites.
- Riesgo QA: imposible construir expected deterministicos para regresion y A/B shadow eval.
- Criterio de correccion: especificar agregacion exacta y caps (incluyendo tratamiento de multiples incidentes y decay temporal).

3. Regla de low-N no define umbral de redondeo/visibilidad para score publico
- Ubicacion: `Reglas de display para N bajo`.
- Problema: define bandas por `v_eff` pero no define precision (entero/1 decimal), politica de redondeo ni si badges cambian por frontera inclusiva exacta en UI/API.
- Riesgo QA: inconsistencias frontend-backend en fronteras 4.99/5, 14.99/15, 39.99/40.
- Criterio de correccion: contrato explicito para formato del score, regla de redondeo y fronteras exactas en backend.

## Hallazgos altos (deben resolverse antes de release)

1. Anti-gaming sin thresholds operativos
- Ubicacion: `Guardrails anti-gaming`.
- Problema: hay reglas (cap por usuario, deboost p99, shadow-eval) sin parametros concretos por categoria/mercado.
- Impacto QA: no se pueden generar casos reproducibles de fraude y expected outcomes.
- Criterio: definir parametros iniciales versionados y fuente de configuracion.

2. Aceptacion de simulacion sin definicion de baseline formal
- Ubicacion: `Simulacion offline (aceptacion)`.
- Problema: se compara contra "baseline naive average" sin especificar version del baseline ni pipeline exacto.
- Impacto QA: resultados no auditables entre corridas.
- Criterio: fijar baseline versionado + semilla + snapshot de dataset.

## Cobertura QA propuesta (minima para iteracion 2)

- Unit tests de formula:
  - clipping final en extremos
  - monotonicidad de `F_volume`
  - rangos de `F_recency`, `F_reliability`, `F_incident`
- Property-based tests:
  - score no negativo ni >100
  - small-sample no supera score estable con mismo R y mayor v
- Contract tests API/UI:
  - fronteras de badges low-N (`<5`, `5-14.999`, `15-39.999`, `>=40` segun definicion final)
  - `n reseñas efectivas` vs total consistente
- Regression dataset tests:
  - reproducibilidad con seed fija
  - verificacion automatica de criterios de exito declarados

## Requisitos de salida para QA PASS en este track de spec

1. Spec actualizado con formulas/rangos consistentes y deterministicos.
2. Parametros anti-gaming versionados (por defecto global + override por categoria).
3. Definicion formal de baseline y artefacto reproducible (seed/snapshot).
4. Test plan actualizado en `qa/test-plans/ratings-reviews-test-matrix.md` con casos de ranking robusto.

## Siguiente accion sugerida
Abrir issue de Producto/Ranking para correcciones del spec y issue de QA para convertir este review en test cases automatizables.
