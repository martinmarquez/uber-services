# RAT-67 / RAT-5 - Iteracion 2: Review tecnico backend del spec de rating 360

Fecha: 2026-05-07
Owner: Back-End Developer
Issue: RAT-67
Spec revisado: `RAT-10-ranking-robusto.md`

## Nota de vigencia (2026-05-11)
- Este documento conserva su contenido tecnico original, pero la pre-condicion ADR de la seccion 0 queda superada.
- Fuente canonica de arquitectura confirmada por CTO: `$AGENT_HOME/ADR.md`.
- Referencia de trazabilidad: `docs/reviews/rat-105-cto-productivity-review-rat-26.md`.

## 0) Pre-condicion de arquitectura (ADR)
- `ADR.md` no existe en este workspace al 2026-05-07.
- Para respetar el mandato de "read ADR before coding", se toma como referencia tecnica vigente:
  - `docs/reviews/rat-22-cto-scoring-architecture-review-iteracion-1.md`
  - `docs/reviews/rat-26-backend-technical-review.md`
  - `qa/reviews/rat-27-rating-360-spec-qa-review-iteracion-1.md`
- Bloqueo de gobernanza: @CTO debe publicar o confirmar el ADR oficial para cerrar decisiones de implementacion final (versionado, eventos, cache e idempotencia cross-service).

## 1) Decision de gate backend (Iteracion 2)
Estado: `GO condicionado` para iniciar implementacion backend por fases (shadow -> rollout), con bloqueos puntuales a resolver antes de release publico.

Justificacion:
- El spec ya corrige los gaps criticos de Iteracion 1 en `F_recency`, `I_sev`, reglas low-N y baseline reproducible.
- Persisten decisiones de contrato y operacion que deben congelarse antes de exponer API publica estable.

## 2) Cobertura tecnica del spec vs arquitectura backend

### 2.1 Formula y determinismo
- `F_recency` esta matematicamente consistente (normalizacion 0..1 y banda exacta 0.85..1.00).
- `I_sev` ahora define agregacion deterministica con decay + cap global.
- Riesgo residual: sin ADR de precision numerica (DB decimal vs float, rounding mode global), puede haber drift entre jobs offline y API online.

Decision propuesta:
- Persistir score robusto en `numeric(5,2)` interno y publicar `displayScore` en 1 decimal (round half away from zero), dejando el valor bruto para auditoria.

### 2.2 Guardrails anti-gaming
- Hay parametros v1 concretos y override por mercado/categoria.
- Riesgo residual: falta contrato formal de origen/configuracion (tabla DB versionada o config service) y estrategia de rollout de cambios.

Decision propuesta:
- Tabla versionada `ranking_guardrails_config` con:
  - `config_version`, `scope_type` (`global|city|category|city_category`), `scope_id`, `payload_json`, `effective_from`, `effective_to`, `updated_by`.
- Resolver lectura por prioridad de scope y snapshotear `config_version` usado en cada recomputo.

### 2.3 Low-N y contrato FE/BE
- El spec define fronteras exactas y formato de salida.
- Aun falta congelar contrato HTTP exacto para evitar divergencia FE/BE.

Contrato recomendado (`/api/v1/providers/{providerId}/rating-summary`):
```json
{
  "providerId": "prov_123",
  "score": 84.27,
  "displayScore": "84.3",
  "confidenceBadge": "medium",
  "effectiveReviewsCount": 22.4,
  "totalReviewsCount": 31,
  "scoreVersion": "ranking_robust_v1",
  "guardrailsVersion": "ranking_guardrails.v1",
  "computedAt": "2026-05-07T10:30:00Z"
}
```
- Si `effectiveReviewsCount < 5`: `displayScore=null`, `confidenceBadge="low"`, `scoreHiddenReason="LOW_EFFECTIVE_SAMPLE"`.

## 3) Migraciones requeridas (orden obligatorio)

1. `reviews` (estado/campos base + constraints de elegibilidad logica).
2. `review_events` (auditoria inmutable).
3. `review_reports` (flujo trust & safety).
4. `review_aggregates` (lectura optimizada y cache warm).
5. `ranking_guardrails_config` y `ranking_job_runs` (trazabilidad de parametros y recomputos).

Controles de integridad minimos:
- Unique idempotente por actor-viaje (`ride_id`, `author_user_id`, `author_role`).
- FKs estrictas + soft delete sin perdida de historial.
- Check constraints (`rating`, enums de estado, non-negative counters).

## 4) API/auth/payments/jobs/cache (delta de implementacion)

### API
- Versionado inicial: `/api/v1`.
- Envelope de error unico:
```json
{
  "error": {
    "code": "VALIDATION_ERROR",
    "message": "rating must be between 1 and 5",
    "details": {"field": "rating"},
    "requestId": "req_..."
  }
}
```
- Idempotency-Key obligatorio en `POST /reviews` y `POST /reports`.

### Auth/AuthZ
- Crear: solo actor elegible de ride completado.
- Edit/Delete: solo owner y dentro de ventana.
- Moderacion: roles `trust_safety|admin`.

### Payments/Elegibilidad
- Gate minimo: `ride.completed` y pago `captured|settled`.
- `chargeback/dispute` no borra review: ajusta senales de `F_reliability` y dispara recomputo.

### Jobs
- `review_aggregate_recompute_job` (incremental + replayable).
- `review_antifraud_scoring_job`.
- `review_publication_release_job`.
- `review_moderation_queue_job`.
- Requisito: todos con `job_run_id` y snapshot de `config_version` para auditoria.

### Cache
- `provider_score:{providerId}` TTL corto + invalidacion por eventos de review/moderacion/pago.
- Evitar cache en writes.
- Fallback seguro: miss de cache siempre recalcula/lee de `review_aggregates` sin retornar 5xx por cache.

## 5) Pruebas backend obligatorias para cerrar este track

Happy path:
- create/edit/delete/report review con auth valida.
- recalculo de score despues de eventos relevantes.

Edge cases:
- reintento con misma idempotency key (sin duplicados).
- carrera concurrente en create (unique constraint).
- frontera exacta low-N (`4.999`, `5`, `14.999`, `15`, `39.999`, `40`).
- score clipping 0..100 bajo incidentes severos.
- cambio de config guardrails con `effective_from` sin romper reproducibilidad.

## 6) Blockers y owner de desbloqueo

1. ADR oficial faltante
- Owner desbloqueo: @CTO
- Accion: publicar `ADR.md` o confirmar documento sustituto oficial con reglas de versionado/event sourcing/cache/idempotencia.

2. Contrato FE/BE de payload final
- Owner desbloqueo: FE Lead + Back-End
- Accion: congelar schema de `rating-summary` y catalogo final de errores v1.

3. Politica de precision/rounding cross-stack
- Owner desbloqueo: Back-End + Data
- Accion: firmar decision unica para calculo interno y display.

## 7) Veredicto final de esta iteracion
- Resultado: review tecnico backend completado para Iteracion 2.
- Estado del issue: listo para avanzar a subtareas de implementacion backend en modo shadow, condicionado a desbloqueos de ADR y freeze de contrato FE/BE.
- Proxima accion recomendada: crear issue hijo de implementacion de migraciones + issue hijo de contract tests FE/BE con schema congelado.
