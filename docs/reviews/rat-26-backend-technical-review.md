# RAT-26 / RAT-5 - Iteracion 1: Review tecnico backend (Rating 360)

Fecha: 2026-05-06
Owner: Back-End
Estado: En progreso (entregable de iteracion 1)

## 0) Dependencia de arquitectura (bloqueo)
- No se encontro `ADR.md` en el repo ni en la carpeta de instrucciones del agente.
- Impacto: falta confirmar lineamientos globales (patrones de versionado, eventos, cache y auditoria).
- Accion de desbloqueo: @CTO debe compartir/confirmar ADR vigente para validar decisiones finales antes de implementacion.

## 1) Contrato API propuesto para coordinacion con Front-End (v1)
Versionado:
- Base path: `/api/v1`
- Compatibilidad: cambios breaking solo en `/v2`.

### 1.1 Crear rating/review
`POST /api/v1/rides/{rideId}/reviews`

Request:
```json
{
  "rating": 4,
  "tags": ["puntual", "trato_amable"],
  "comment": "Buen servicio"
}
```

Validaciones:
- `rating`: entero 1..5 (requerido)
- `tags`: array max 10, valores whitelist por catalogo backend
- `comment`: opcional, max 240 chars, sanitizado

Response 201:
```json
{
  "reviewId": "rev_01J...",
  "rideId": "ride_...",
  "authorRole": "rider",
  "rating": 4,
  "tags": ["puntual", "trato_amable"],
  "comment": "Buen servicio",
  "status": "pending_publication",
  "createdAt": "2026-05-06T20:10:00Z"
}
```

Errores:
- `400 VALIDATION_ERROR`
- `401 UNAUTHENTICATED`
- `403 NOT_ELIGIBLE_TO_REVIEW`
- `404 RIDE_NOT_FOUND`
- `409 DUPLICATE_REVIEW` (idempotency/replay)
- `422 REVIEW_WINDOW_EXPIRED`

### 1.2 Editar review dentro de ventana
`PATCH /api/v1/reviews/{reviewId}`

Request:
```json
{
  "rating": 3,
  "tags": ["demora"],
  "comment": "Llego tarde"
}
```

Errores adicionales:
- `403 NOT_OWNER`
- `422 EDIT_WINDOW_EXPIRED`

### 1.3 Eliminar review (soft delete)
`DELETE /api/v1/reviews/{reviewId}`

Response 200:
```json
{
  "reviewId": "rev_01J...",
  "status": "removed_by_author"
}
```

### 1.4 Reportar review
`POST /api/v1/reviews/{reviewId}/reports`

Request:
```json
{
  "reason": "offensive_content",
  "description": "Insulto explicito"
}
```

Response 202 (cola moderacion):
```json
{
  "reportId": "rep_01J...",
  "status": "queued"
}
```

### 1.5 Feed de reviews por proveedor
`GET /api/v1/providers/{providerId}/reviews?cursor=...&limit=20&sort=recent`

Reglas:
- Excluir removidas/no publicadas del feed publico.
- Mantener consistencia de paginacion por cursor estable.

## 2) Error envelope estandar (todos los endpoints)
```json
{
  "error": {
    "code": "VALIDATION_ERROR",
    "message": "rating must be between 1 and 5",
    "details": {
      "field": "rating"
    },
    "requestId": "req_01J..."
  }
}
```

## 3) Esquema de datos propuesto (migracion primero)

### 3.1 Tabla `reviews`
- `id` (pk, ulid/uuid)
- `ride_id` (fk rides)
- `author_user_id` (fk users)
- `target_user_id` (fk users)
- `author_role` (`rider|provider`)
- `rating` (smallint check 1..5)
- `comment` (varchar(240), nullable)
- `status` (`pending_publication|published|removed_by_author|removed_by_moderation`)
- `visibility` (`public|hidden`)
- `created_at`, `updated_at`, `deleted_at`
- `published_at` (nullable)
- `version` (int, optimistic locking)

Indices/constraints clave:
- `unique (ride_id, author_user_id, author_role)` para prevenir duplicados por actor-viaje.
- index `(target_user_id, status, published_at desc)` para feed.
- check de `rating`.

### 3.2 Tabla `review_tags`
- `review_id` fk
- `tag_code` (catalogo)
- pk compuesta `(review_id, tag_code)`

### 3.3 Tabla `review_events` (auditoria)
- `id`, `review_id`, `event_type`, `actor_id`, `payload_json`, `created_at`
- Registrar create/edit/delete/report/moderation_decision/publication_release.

### 3.4 Tabla `review_reports`
- `id`, `review_id`, `reporter_id`, `reason_code`, `description`, `status`, `created_at`, `resolved_at`
- index por `status, created_at` para colas.

### 3.5 Tabla `review_aggregates`
- `target_user_id` pk
- `effective_reviews_count` (ponderado si aplica modelo robusto)
- `avg_rating`
- `score_robust` (0..100)
- `last_review_at`
- `updated_at`

## 4) AuthN/AuthZ
- AuthN: JWT/session valida obligatoria en writes.
- AuthZ reglas minimas:
  - solo actores de ride completado pueden crear review;
  - solo owner puede editar/borrar dentro de ventana;
  - moderacion solo rol trust_safety/admin.
- Anti-replay: `Idempotency-Key` requerido en `POST /reviews` y `POST /reports`.

## 5) Pagos y elegibilidad
- Reviews habilitadas solo si `ride.status=completed` y `payment.status in (captured, settled)`.
- Si pago en disputa/chargeback, no borrar historico, pero marcar con senal de riesgo para ranking (`F_reliability`).
- Integracion asincrona: eventos de pagos recalculan elegibilidad y score.

## 6) Background jobs
- `review_publication_release_job`: publica al cumplir doble envio o timeout (14 dias).
- `review_aggregate_recompute_job`: recalcula agregados y score robusto incremental.
- `review_moderation_queue_job`: prioriza reportes por severidad.
- `review_antifraud_scoring_job`: calcula `a_i` y riesgo agregado.

## 7) Caching
- Cache lectura feed provider (`provider_reviews:{providerId}:{cursor}`) TTL corto (30-60s).
- Cache agregados provider (`provider_score:{providerId}`) invalidacion por evento de review/moderacion.
- Evitar cache en endpoints de escritura.

## 8) Seguridad y data integrity (no negociable)
- Sanitizacion estricta de `comment` y normalizacion de unicode para prevenir bypass.
- Rate limiting por usuario/IP para submit/report.
- Logs estructurados con `requestId`, sin exponer PII sensible.
- Soft delete + auditoria inmutable en `review_events`.
- Transacciones en create/update/delete + outbox/evento para consistencia eventual.

## 9) Pruebas backend minimas requeridas
Happy path:
- crear review valida en ride elegible;
- editar dentro de ventana;
- reportar review y encolar moderacion;
- recalculo de agregados tras create/delete.

Edge cases:
- doble submit con misma idempotency key;
- actor no elegible;
- ventana vencida (create/edit);
- race create simultaneo (constraint unique);
- timeout en dependencia de agregados (reintentos sin corrupcion);
- intento de bypass auth en endpoints de moderacion.

## 10) Riesgos y decisiones pendientes para CTO
1. Confirmar ADR de versionado/eventos/caching (bloqueante de arquitectura final).
2. Definir DB principal y estrategia exacta de locking (optimistic vs pessimistic por flujo).
3. Confirmar SLA y toolchain de moderacion humana.
4. Alinear con Front-End payload final de tags y catalogo de errores (`code`).
5. Definir politica de retencion para `review_events` y `review_reports` segun compliance AR.

## 11) Proxima accion concreta
- Crear propuesta de migraciones SQL v1 (`reviews`, `review_tags`, `review_events`, `review_reports`, `review_aggregates`) y test de constraints/idempotencia una vez confirmado ADR.
