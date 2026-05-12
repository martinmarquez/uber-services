# RAT-19 Review Gate: Impacto en Experiencia Cliente

Fecha: 2026-05-06  
Owner: Customer Success  
Scope: RAT-13 (loops de confianza y solicitud de reseñas sin fricción)

## Decisión de Gate

Estado: **PASS CONDICIONAL**

RAT-13 puede continuar a implementación controlada si se cumplen los guardrails y métricas de esta revisión para evitar fricción, sobrecarga de soporte y riesgo de churn.

## Impacto Esperado en Cliente

- Menor fricción para dejar reseñas post-servicio (mejor tasa de completion).
- Mayor confianza percibida por señales de verificación y estados de revisión.
- Menor volumen de tickets repetitivos si el copy de estados y apelación es claro.

## Riesgos de Experiencia (y mitigación)

1. Riesgo: usuarios no entienden por qué su reseña queda "En revisión".  
Mitigación: usar microcopy explícito + enlace directo a apelación en primer contacto.

2. Riesgo: prestadores perciben sanciones como arbitrarias y escalan a soporte.  
Mitigación: template de respuesta con evidencia mínima requerida y SLA visible.

3. Riesgo: baja calidad de reseñas por flujo excesivamente corto.  
Mitigación: mantener comentario opcional, pero priorizar tags contextuales por sentimiento.

4. Riesgo: aumento de churn en cuentas estratégicas ante falsos positivos de moderación.  
Mitigación: activar bandera `exec-watch` y escalación inmediata al CEO en incidentes estratégicos.

## Guardrails de Onboarding/Soporte

- Onboarding in-app debe cumplir:
  - CTA habilitado solo tras seleccionar estrellas.
  - Mensaje de confirmación post-envío claro y breve.
  - Estado de reseña visible: verificada / en revisión / no recomendada.
- Soporte debe contar con:
  - Macro de "reseña en revisión" con próximos pasos.
  - Macro de "apelación aceptada/rechazada" con motivo y evidencia.
  - Ruta de escalación `exec-watch` para cuentas estratégicas.

## Métricas de Retención y Soporte (primer corte)

- `review_submit_completion_rate` (objetivo: no caer vs baseline actual).
- `review_flow_dropoff_after_star_select` (objetivo: tendencia descendente).
- `support_tickets_review_status_confusion` (objetivo: <= 15% del total de tickets de reseñas tras semana 2).
- `appeal_reopen_rate` (objetivo: tendencia descendente en 2 ciclos).
- `exec_watch_incidents` (objetivo: 100% escalados al CEO < 4h).

## Criterios de Seguimiento para Cierre Final de Gate

- 2 ciclos de QA completados con evidencia en `qa/test-results/`.
- Sign-off cruzado de UX/Security/CTO (ya requerido por el quality gate técnico).
- Validación CS de:
  - claridad de copy de estados de confianza,
  - macros operativas de soporte,
  - checklist de escalación CEO para churn risk.

## Próxima Acción

Crear issue hijo para instrumentar dashboard CS de métricas de fricción/soporte y hacer lectura de primera semana post-release.
