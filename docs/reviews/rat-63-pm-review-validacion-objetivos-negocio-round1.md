# RAT-63 Round 1 PM Review: validacion de objetivos de negocio

Fecha: 2026-05-07
Owner: PM
Estado: Ready for execution handoff
Issue: RAT-63

## Objetivo
Validar que el scope activo de RAT-6 y su secuencia de sprint contribuyan a los objetivos de negocio del brief (trust + conversion) sin introducir scope creep.

## Decision de producto
1. RAT-6 mantiene prioridad alta porque impacta dos metricas norte simultaneamente: `% bookings con review verificada` y `successful_booking_rate`.
2. Se sostiene regla de foco: primero claridad de estados + apelaciones + exclusion de score para estados no verificables; despues optimizaciones de growth.
3. Se rechaza expansion de alcance en esta fase para proteger time-to-value: sin nuevos estados, sin cambios de thresholds de fraude, sin localizacion adicional.

## Gate de objetivos de negocio (must pass)
### Gate 1: Trust operativo
- KPI: `appeal_sla_met_rate` >= 90% en cohorte piloto semanal.
- KPI: `fraud_incidence_per_1k_reviews` sin tendencia ascendente por 2 semanas.
- Criterio: cualquier incremento de fraude junto a mejora de conversion invalida rollout amplio.

### Gate 2: Friccion de UX
- KPI: `review_submit_completion_rate` no cae contra baseline previa a RAT-6.
- KPI: `review_flow_dropoff_after_star_select` con tendencia descendente semana a semana.
- Criterio: si cae completion rate, se prioriza correccion de copy/flujo antes de nuevas features.

### Gate 3: Claridad de soporte
- KPI: `support_tickets_review_status_confusion` <= 15% de tickets de reseñas en semana 2 post release.
- KPI: `appeal_reopen_rate` con tendencia descendente en 2 ciclos.
- Criterio: si confusion o reaperturas suben, bloquear nuevas superficies y corregir mensajes/operacion.

## User Stories priorizadas (testables)
### Story 1 (Cliente)
Como cliente, quiero interpretar rapido la confiabilidad de una reseña para decidir contratacion con menos riesgo.

Criterios de aceptacion:
- Dado `verificada`, se muestra badge y supporting canonico.
- Dado `en_revision` o `no_recomendada`, la reseña no impacta score publico.
- Dado `removida`, la reseña no aparece en feed publico.

### Story 2 (Autor de reseña)
Como autor, quiero entender estado y via de apelacion para corregir errores sin friccion.

Criterios de aceptacion:
- Cada estado no verificado expone ruta de apelacion en soporte.
- Cada apelacion guarda trazabilidad visible de estado final.
- Macro de soporte incluye SLA de acuse (<24h) y resolucion (<=7 dias; hasta 15 complejos).

### Story 3 (Soporte/Operaciones)
Como agente de soporte, quiero un marco unico de mensajes y tags para resolver rapido sin inconsistencias.

Criterios de aceptacion:
- Macros canonicas alineadas a policy y UI.
- Tags minimos activos: `review-status-confusion`, `review-appeal-followup`, `exec-watch`.
- Casos de incentivo condicionado a nota etiquetados `incentive_bias` con escalation minima SEV-1.

## Secuencia de sprint y dependencias
1. FE: mapping de estados + microcopy canonico.
2. BE: exclusion de score para estados no verificables + trazabilidad de apelacion.
3. CS Ops: macros finales y playbook de triage.
4. QA: matriz de estados/copy + smoke de analitica de dropoff/completion.
5. PM: go/no-go contra gates 1-3.

Dependencias activas:
- Policy/enum y reason-codes definidos en artefactos previos de RAT-42 y RAT-44.
- QA baseline y contratos de testabilidad de trust/ranking ya cerrados.

## No alcance (anti-scope creep)
- Nuevos estados de moderacion.
- Recalibracion de umbrales antifraude.
- Expansion multi-idioma.
- Cambios en ranking fuera del contrato vigente.

## Riesgos y escalacion al CEO
- Conflicto posible: presion por crecimiento rapido via incentivos agresivos vs integridad de reputacion.
- Regla PM: cualquier request que condicione nota para empujar conversion se eleva al CEO antes de entrar a sprint.

## Next action
- Engineering/CS ejecutan secuencia definida y reportan KPIs de Gate 1-3 en primer corte semanal post release.
