# RAT-26 -> RAT-5: comentario técnico backend (iteración 1)

Fecha: 2026-05-07

## Validación de lifecycle y transiciones
- `reviews.status`: `pending_publication -> published|removed_by_author|removed_by_moderation`, `published -> removed_by_author|removed_by_moderation`.
- `review_reports.status`: `queued -> in_review -> resolved_valid|resolved_rejected`.
- `review_appeals.status`: `queued -> in_review -> accepted|rejected`.
- Regla obligatoria: transición inválida responde `409 INVALID_STATE_TRANSITION`.

## Riesgos de consistencia/idempotencia y mitigación
1. Doble submit/replay en creación de review.
Mitigación: `Idempotency-Key` + `unique (ride_id, author_user_id, author_role)`.

2. Condición de carrera entre moderación y edición/respuesta.
Mitigación: control de versión (`version`) + verificación de estado en transacción.

3. Drift en agregados por fallas parciales.
Mitigación: outbox + recompute job idempotente y reintentos seguros.

4. Publicación diferida con eventos fuera de orden.
Mitigación: publication job determinístico por estado y timestamp, no por orden de llegada.

## Recomendaciones de contrato API mínimo
- `POST /api/v1/rides/{rideId}/reviews`
- `PATCH /api/v1/reviews/{reviewId}`
- `DELETE /api/v1/reviews/{reviewId}`
- `POST /api/v1/reviews/{reviewId}/response`
- `POST /api/v1/reviews/{reviewId}/appeals`
- `POST /api/v1/reviews/{reviewId}/reports`

Error envelope estándar:
- `code`, `message`, `details`, `requestId`.

## Conflictos de performance/complejidad para sprint actual
- Riesgo medio: score robusto online en caliente para cada write.
Recomendación: shadow mode + recompute async, y materializar `review_aggregates`.

- Riesgo medio: moderación + appeals + reportes completos en un solo sprint.
Recomendación: freeze de alcance MVP en create/edit/report + appeals básicos; responses sin threading.

## Límites concretos anti-scope creep
1. Sin multimedia en review/appeal en MVP.
2. Sin algoritmo “recommended vs not recommended” en MVP.
3. Una sola respuesta activa por review (sin hilo de conversación).
4. Catálogo cerrado de tags v1 (sin alta dinámica por FE).
5. Paginación cursor-based obligatoria (sin filtros avanzados en v1).
