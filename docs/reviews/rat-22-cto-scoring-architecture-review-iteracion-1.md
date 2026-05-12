# RAT-22 - Review CTO de arquitectura de scoring (Iteracion 1)

Fecha: 2026-05-06
Issue: RAT-22
Scope: RAT-10 (Ranking Science - score robusto)
Owner: Data Analyst

## Acuse de contexto
Asignacion recibida desde RAT-41 para tomar ownership tecnico de la linea de scoring (RAT-10).

## Decision gate (arquitectura)
Aprobacion condicionada para avanzar a implementacion controlada, sujeta a cerrar decisiones criticas de especificacion y operacion.

## Evaluacion tecnica

### 1) Estabilidad operativa
Estado: Riesgo medio (mitigable)

- La formula compuesta `S = 100 * Q_bayes * F_volume * F_recency * F_reliability * F_incident` es estable por clipping y factores acotados.
- Riesgo principal: `F_incident` y anti-fraude no estan totalmente parametrizados para comportamiento deterministico ante bursts/incidentes multiples.
- Riesgo secundario: inconsistencia entre banda declarada y formula de `F_recency` ya observada por QA.

Recomendacion:
- Congelar parametros iniciales en config versionada (`m`, `k`, `lambda`, `gamma`, cap por usuario, umbral burst, cap de penalizacion por categoria).
- Definir agregacion explicita de `I_sev` con cap global para evitar sobrepenalizacion acumulativa.

### 2) Complejidad de implementacion
Estado: Complejidad media-alta

- Requiere pipeline de eventos y recomputo incremental (`review_aggregate_recompute_job` + `review_antifraud_scoring_job`).
- Requiere sincronizacion entre scoring publico, estados de moderacion y eventos de pagos/chargeback.
- El costo tecnico principal esta en observabilidad y rollback rapido (<1h) ante incidentes graves.

Recomendacion:
- Implementacion en 2 fases:
  1. Fase 1 (shadow): score robusto en paralelo, sin afectar ranking publico.
  2. Fase 2 (gated rollout): activacion por categoria/ciudad con kill-switch.

### 3) Riesgo de abuso
Estado: Riesgo alto si no se parametriza

- Guardrails actuales existen a nivel conceptual, pero faltan umbrales operativos para enforcement reproducible.
- Sin thresholds versionados, aumenta riesgo de falsos positivos/negativos y disputas de proveedores.

Recomendacion:
- Definir thresholds minimos v1 por mercado:
  - `burst_window_hours`
  - `burst_count_threshold_pctl`
  - `max_user_contribution_30d`
  - `risk_deboost_cap`
- Versionar decisiones anti-fraude por fecha de vigencia para trazabilidad de experimentos.

## Decisiones CTO requeridas (go/no-go)
1. Confirmar definicion matematica de `I_sev` (funcion de agregacion + cap + decay).
2. Confirmar contrato final de `F_recency` (alinear formula y rango publicado).
3. Aprobar tabla de parametros anti-gaming v1 y ownership de mantenimiento.
4. Aprobar rollout por fases con kill-switch y criterios de rollback.

## Matriz de decision CTO (iteracion 2)
| Decision | Estado requerido | Criterio de aprobacion | Riesgo si no se cierra |
| --- | --- | --- | --- |
| `I_sev` formula final | GO/NO-GO | Funcion + cap global + decay documentados en spec y testeables | Penalizacion erratica y disputas por injusticia |
| `F_recency` contrato final | GO/NO-GO | Rango de salida y formula coinciden en spec + QA | Drift entre producto y backend |
| Anti-gaming v1 thresholds | GO/NO-GO | Tabla versionada por mercado con owner operativo | Falsos positivos/negativos y gaming activo |
| Rollout + rollback | GO/NO-GO | Kill-switch validado y triggers de rollback definidos | Incidente sin salida rapida |

## Acceptance criteria propuestos para cierre de RAT-22
1. CTO deja decision explicita GO/NO-GO en los 4 puntos de la matriz.
2. Spec RAT-10 incorpora formulas deterministicas (`I_sev`, `F_recency`) sin contradicciones internas.
3. Existe tabla anti-gaming `v1` versionada con owner de mantenimiento y fecha de vigencia.
4. Runbook operativo documenta kill-switch, rollback `<1h` y flujo de comunicacion.
5. Dashboard de gates reporta en ventana movil 7d: conversion, churn top decil y claims/refunds.

## RACI de cierre tecnico
- CTO: decide GO/NO-GO de arquitectura.
- Data Analyst (owner RAT-22): valida consistencia matematica y gates de negocio.
- Eng/Backend owner RAT-10: implementa spec final y controles operativos.
- QA/Stats: valida consistencia de formula publicada vs formula ejecutada.

## KPI y monitoreo (gates de negocio)
- Gate de objetivo: alinear el dashboard de scoring con OKR trimestral de Trust/Conversion antes de activar fase 2.
- Gate de riesgo board: escalar a Board si en ventana movil de 7 dias ocurre cualquiera de:
  - caida de conversion > 3% vs control
  - suba de churn proveedores top decil > 2 p.p.
  - incremento de claims/refunds > 10%

## Entregables minimos para cerrar arquitectura
1. Spec RAT-10 corregido con formulas deterministicas y rangos consistentes.
2. Parametros anti-gaming v1 versionados.
3. Runbook de incidentes de scoring (deteccion, rollback, comunicacion).
4. Dashboard de monitoreo A/B y guardrails de riesgo con alertas.

## Proximo paso inmediato
Crear subtareas de ejecucion para:
- cierre de spec matematico,
- parametrizacion anti-fraude,
- y tablero de monitoreo de gates.
