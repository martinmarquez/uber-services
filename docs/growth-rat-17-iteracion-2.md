# RAT-17 - Iteracion 2: optimizacion post-aprendizajes

## Objetivo
Ejecutar una segunda iteracion de optimizacion del funnel de calificacion/review incorporando aprendizajes de Iteracion 1, con validacion estadistica minima de 100+ muestras por variante y recomendacion final de rollout.

## Aprendizajes incorporados (entrada esperada)
Completar con hallazgos de Iteracion 1 antes de lanzar:
- Copy: `{{insight_copy}}`
- Timing: `{{insight_timing}}`
- Trigger/contexto: `{{insight_trigger}}`

## Experimentos propuestos

### E1 - Copy de CTA en prompt de calificacion
- Hipotesis: un copy mas concreto sobre impacto local mejora conversion a review completa.
- Control (A): copy actual.
- Variante (B): "Tu opinion mejora la experiencia en tu zona. Califica en 15 segundos".
- KPI primario: `review_submit_rate`.
- KPI secundarios: `prompt_to_open_rate`, `dropoff_after_open`.

### E2 - Timing del prompt post-servicio
- Hipotesis: retrasar 10 minutos el prompt mejora calidad sin bajar conversion total.
- Control (A): prompt inmediato.
- Variante (B): prompt a los 10 minutos.
- KPI primario: `review_submit_rate`.
- KPI secundarios: `avg_review_length`, `rating_distribution_stability`.

### E3 - Trigger contextual en usuarios recurrentes
- Hipotesis: trigger por "3er viaje de la semana" mejora respuesta en usuarios activos.
- Control (A): trigger generico.
- Variante (B): trigger contextual con referencia a uso recurrente.
- KPI primario: `review_submit_rate` en cohortes recurrentes.
- KPI secundarios: `7d_repeat_rate`, `notification_opt_out_rate`.

## Diseno estadistico y reglas de decision
- Muestra minima por variante: `>=100` usuarios expuestos (gate obligatorio).
- Asignacion: 50/50 por usuario elegible.
- Ventana minima recomendada: 7 dias corridos para controlar estacionalidad.
- Criterio de exito: mejora de KPI primario con significancia (`p < 0.05`) y sin degradacion critica en secundarios.
- Guardrail: detener variante si cae >10% relativo en `review_submit_rate` vs control durante 2 checkpoints consecutivos.

## Instrumentacion requerida
- Eventos:
  - `rating_prompt_shown`
  - `rating_prompt_opened`
  - `rating_submitted`
  - `review_submitted`
  - `prompt_opt_out`
- Dimensiones:
  - `experiment_id`, `variant`, `user_segment`, `country`, `app_version`, `trigger_type`, `time_since_trip_end`.

## Framework de priorizacion (impacto x esfuerzo)
- Prioridad 1: E1 (copy) por bajo esfuerzo y alta velocidad de aprendizaje.
- Prioridad 2: E2 (timing) por impacto potencial en calidad.
- Prioridad 3: E3 (trigger contextual) por dependencia de segmentacion.

## Gobierno y escalaciones
- Gate CMO por presupuesto: cualquier iniciativa de growth con gasto incremental `>$10,000` requiere aprobacion previa.
- Escalacion por blocker: asignar a CMO con comentario de desbloqueo y accion requerida.
- Escalacion board: si no se cumple target de growth por 2+ trimestres consecutivos.

## Criterio de rollout final
Aplicar rollout gradual (10% -> 50% -> 100%) solo para variantes ganadoras que cumplan:
- KPI primario mejor o igual con significancia.
- Sin deterioro material en guardrails.
- Sin incremento de costo de adquisicion no recuperable por LTV.

## Entregable final esperado
Sintesis con:
- Resultado por experimento (ganador/perdedor/inconcluso).
- Impacto porcentual en KPIs.
- Recomendacion de rollout y riesgos.
- Proxima ola de experimentos (Iteracion 3).
