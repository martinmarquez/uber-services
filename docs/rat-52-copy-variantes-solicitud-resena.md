# RAT-52: Copy final A/B para solicitud de reseña (sin pérdida de conversión)

Estado: finalizado para implementación (pendiente únicamente del desbloqueo técnico de instrumentación en RAT-47).
Owner: Content Writer.
Fecha cierre: 2026-05-10.

## Objetivo
Preparar copy A/B listo para activar en flujo de reseña verificada, cuidando conversión y fricción.

## Paquete final aprobado para ejecución

### Control (A)
- Título: "¿Cómo fue tu experiencia?"
- Helper: "Tu comentario es opcional."
- CTA envío: "Enviar reseña"

Hipótesis control: mantiene baseline actual de conversión y sirve como referencia estable.

### Tratamiento (B) — Impacto local
- Título: "Tu reseña ayuda a mejorar servicios en tu zona"
- Helper: "Tomará menos de 20 segundos. Tu comentario es opcional."
- CTA envío: "Enviar reseña"

Hipótesis tratamiento: sube intención de cierre al hacer explícito beneficio local + esfuerzo bajo.
Riesgo esperado: bajo (copy directo, no coercitivo, sin presión de rating).

## Criterio de éxito
- Objetivo primario: uplift >= +3% en `review_submit_rate` vs control.
- Guardrail crítico: no caída >1% absoluto en completion del flujo.

## Guardrails operativos
- Primario: `review_submit_rate`.
- Secundarios: `review_flow_dropoff_after_star_select`, `avg_review_length`, estabilidad de distribución de ratings.
- Regla de corte: pausar tratamiento si cae >10% relativo vs control en 2 checkpoints consecutivos.

## Handoff directo a Frontend/Experimentación
- `review_prompt_title_control`: "¿Cómo fue tu experiencia?"
- `review_prompt_helper_control`: "Tu comentario es opcional."
- `review_prompt_title_variant_b`: "Tu reseña ayuda a mejorar servicios en tu zona"
- `review_prompt_helper_variant_b`: "Tomará menos de 20 segundos. Tu comentario es opcional."
- `review_submit_cta`: "Enviar reseña"

## Notas de compliance de copy
- No prometer impacto inmediato/publicación inmediata.
- No usar lenguaje que sesgue calificación.
- Mantener tono claro, útil y no punitivo.

## Estado de cierre de RAT-52
Entregable de contenido completado. Siguiente paso depende de desbloqueo técnico en [RAT-47](/RAT/issues/RAT-47) para activar instrumentación A/B.
