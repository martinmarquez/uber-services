# ADR - Arquitectura de Backend (Activa)

Fecha: 2026-05-11  
Estado: vigente

## Contexto

Este repositorio implementa el dominio de reseñas con moderación, scoring y contratos API v1.  
Este ADR consolida decisiones vigentes para ejecución backend y referencia documentos de detalle.

## Decisiones

1. API versionada bajo `/api/v1` con contratos explícitos de validación y errores.
2. Estados canónicos de moderación de reseñas:
   - `verificada`
   - `en_revision`
   - `no_recomendada`
   - `removida`
3. Transiciones de moderación restringidas por reglas de dominio; transiciones inválidas responden `409` con `error.code=INVALID_STATE_TRANSITION`.
4. Autorización obligatoria:
   - Moderación: actor autenticado con rol `moderator`.
   - Reportes/apelaciones: actor autenticado.
5. Integridad de score público:
   - Solo reseñas `verificada` impactan agregados públicos.
   - `en_revision`, `no_recomendada` y `removida` quedan excluidas.
6. Umbrales operativos de baja confiabilidad:
   - `0-39`: `verificada`
   - `40-69`: `verificada` (peso reducido en ranking)
   - `70-84`: `no_recomendada`
   - `85-100`: `en_revision`
7. Idempotencia y trazabilidad:
   - Operaciones sensibles (create, moderation, appeal, report) usan `idempotencyKey`.
   - Eventos de dominio firmados y verificables offline.
8. Persistencia:
   - Soporte SQLite y Postgres con migraciones por runner dedicado.

## Referencias normativas

- `docs/reviews/rat-42-api-ui-moderation-contract-v1.md`
- `docs/reviews/rat-45-be-eligibility-events-moderation-domain-v1.md`
- `docs/reviews/rat-322-fe-be-contract-freeze-v1-2026-05-11.md`
- `docs/trust-safety/rat-310-antigaming-parameterization-governance-v1.md`
