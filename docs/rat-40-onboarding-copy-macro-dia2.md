# RAT-40 / RAT-37.2: Ajustes de onboarding, copy y macro soporte (lectura dia 2)

Fecha: 2026-05-06  
Owner: Product Manager  
Prioridad: Alta  
Dependencias: RAT-37 (lectura de friccion), RAT-19 (guardrails CS), ONBOARDING.md (flujo activo)

## Contexto y decision

La lectura temprana de `RAT-37` exige mitigacion de alerta amarilla en 24h: ajustar onboarding microcopy y macros de soporte para reducir confusion de estados y abandono post-seleccion de estrellas.

Decision PM: **aprobar solo scope de bajo esfuerzo y alto impacto inmediato**.  
No se habilitan cambios de logica de moderacion, ranking ni nuevos estados en esta iteracion.

## Objetivos de negocio (dia 2 -> dia 7)

1. Bajar `support_tickets_review_status_confusion` hacia <= 15% en semana 2.
2. Mejorar tendencia de `review_flow_dropoff_after_star_select` sin degradar completion total.
3. Evitar incidentes `exec-watch` no escalados y sostener SLA < 4h.

## Scope comprometido (in)

1. Ajuste de microcopy de estados y confirmacion post-envio.
2. Cambio de UX copy en paso final para priorizar tags y comentario opcional.
3. Macro CS unificada para `en revision`/`no recomendada` con CTA de apelacion y SLA.
4. Taxonomia minima de motivos para respuesta estructurada en soporte.

## Scope excluido (out)

1. Nueva taxonomia de moderacion completa.
2. Cambios en algoritmo/fallback anti-fraude.
3. Nuevos campos en apelacion o rediseño de dashboard.

## User stories y criterios de aceptacion

### US-40.1 — Claridad de estado en onboarding y detalle
Como usuario, quiero entender rapidamente que significa cada estado para saber que esperar sin contactar soporte.

Aceptacion:
- Dado estado `En revision`, cuando veo la reseña, entonces leo mensaje con validacion en curso y expectativa de notificacion.
- Dado estado `No recomendada`, cuando veo la reseña, entonces leo motivo de alto nivel no punitivo y CTA a apelacion.
- Dado confirmacion de envio, cuando termino flujo, entonces veo texto breve que indica que el estado puede cambiar tras validacion.

### US-40.2 — Menor friccion en paso final de reseña
Como usuario, quiero cerrar la reseña rapido luego de seleccionar estrellas para no abandonar el flujo.

Aceptacion:
- Dado que llegue al paso final, cuando visualizo la pantalla, entonces primero veo tags sugeridos y luego comentario opcional.
- Dado que no escribo comentario, cuando envio con estrellas + tags, entonces el flujo permite completar sin error.
- Dado que agrego comentario corto, cuando envio, entonces no se bloquea por longitud minima.

### US-40.3 — Macro de soporte consistente y accionable
Como agente de soporte, quiero una macro unica para confusion de estado para responder rapido y reducir recontacto.

Aceptacion:
- Dado ticket con tag `review-status-confusion`, cuando aplico macro, entonces incluye explicacion de estado, SLA objetivo y CTA de apelacion.
- Dado caso de cuenta estrategica, cuando se detecta riesgo, entonces macro exige flag `exec-watch` y escalacion CEO < 4h.
- Dado apelacion ya resuelta, cuando respondo cierre, entonces incluyo decision y motivo estructurado.

## Secuenciacion de sprint (ejecucion 24h)

1. UX Writing + PM: congelar copy final de estados y confirmacion.
2. Frontend: aplicar copy y orden de componentes (tags antes de comentario).
3. CS Ops: publicar macro unificada + checklist de triage por tags.
4. QA: validar criterios de US-40.1/40.2/40.3 en smoke de regresion.

## Riesgos y mitigacion

1. Riesgo: copy excesivo aumenta carga cognitiva.  
Mitigacion: limite de 1-2 frases por estado y CTA unico.
2. Riesgo: inconsistencia entre app y macro soporte.  
Mitigacion: fuente unica de copy en `ONBOARDING.md` y `KNOWLEDGE_BASE.md`.
3. Riesgo: cuentas estrategicas sin escalacion.  
Mitigacion: control diario de `exec-watch` en `CHURN_TRACKING.md`.

## Criterio de cierre RAT-40

- Copy aprobado y reflejado en `ONBOARDING.md` y `KNOWLEDGE_BASE.md`.
- Macro CS publicada con tags operativos activos.
- QA smoke completado para 3 historias con evidencia en `qa/test-results/`.
- Comentario de estado a CEO con decision de continuar/ajustar en lectura dia 7.

## Cierre CEO Gate (RAT-80)

### DRI y checkpoint dia 7

- DRI lectura dia 7: Product Manager (`0724f3ff-7732-4f6f-8220-7c4153c7c632`).
- Readout pactado: 2026-05-11 17:00 ART (UTC-3).

### Evidencia obligatoria para cierre

1. QA smoke evidence (US-40.1, US-40.2, US-40.3) en `qa/test-results/`.
2. Delta dia 7 de:
   - `support_tickets_review_status_confusion`
   - `review_flow_dropoff_after_star_select`
3. Si falta cualquier KPI: registrar blocker con owner, accion y ETA en update de issue.
