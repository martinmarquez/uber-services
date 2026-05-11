# RAT-323 Backend Progress - 2026-05-11

Estado: in_progress
Owner: Back-End

## Resumen del heartbeat

Se completó alineación de contrato HTTP para endpoints lifecycle de reviews (v1), con foco en semántica de errores y seguridad de acceso:

- `POST /api/v1/reviews/:reviewId/reports`
  - `401` cuando actor no autenticado.
  - `404` cuando review no existe.
  - `400` para payload inválido.
- `POST /api/v1/reviews/:reviewId/response`
  - `403` para actor no target (`not_review_target`) o review no respondable.
  - `400` para mensaje inválido.
- `POST /api/v1/reviews/:reviewId/appeals`
  - `401` cuando actor no autenticado.
  - `403` para `forbidden_actor`.
  - `400` para nota/idempotency inválidas.
- Moderation lifecycle:
  - transiciones inválidas responden `409 INVALID_STATE_TRANSITION`.

## Evidencia técnica

- Commit: `d90e73a`
- Archivos:
  - `server/src/http/server.js`
  - `server/tests/httpServer.test.js`
- Verificación:
  - `node --test server/tests/httpServer.test.js` (pass)
  - `node --test server/tests/reviewService.test.js server/tests/routes.test.js server/tests/reviewRules.test.js` (pass)

## Coordinación FE/BE (contrato)

Contrato v1 ratificado para FE:
- Error envelope estable con `error.code` + `error.details.code`.
- Semántica de status para auth/validation/conflict ya consistente en lifecycle endpoints.
- Sin breaking changes de payload en respuestas exitosas.

## Próxima acción

Implementar y validar criterio de aceptación pendiente sobre migraciones reversibles:
1. Definir estrategia `down` para migraciones lifecycle (`review_reports`, `review_tags`, `review_aggregates`, `review_responses`, `review_appeals`) en SQLite/Postgres.
2. Agregar test de rollback/reapply mínimo para asegurar reversibilidad sin drift de esquema.

## Update 2026-05-11 (rollback/reapply)

Se implementó reversibilidad de migraciones y test de rollback/reapply para cerrar el criterio pendiente de integridad:

- Commit: `52d0926`
- Cambios:
  - runners de migración con soporte `direction=up|down`:
    - `server/src/db/runSqliteMigrations.js`
    - `server/src/db/runPostgresMigrations.js`
  - migraciones `down` agregadas:
    - `server/migrations/sqlite/down/*.sql`
    - `server/migrations/down/*.sql`
  - test de integración rollback/reapply:
    - `server/tests/reviewMigrationRollback.test.js`

Verificación ejecutada:
- `node --test server/tests/reviewMigrationRollback.test.js`
  - SQLite: pass (`up/down/up` reversible)
  - Postgres: skip automático sin `DATABASE_URL`

Riesgo abierto menor:
- Ejecutar el mismo test con `DATABASE_URL` en CI/paridad Postgres para validar reversibilidad completa en runtime objetivo.

## Update 2026-05-11 (concurrencia lifecycle)

En respuesta a sweep de estado (RAT-556), se deja evidencia de ejecución activa con cobertura de carrera entre instancias para lifecycle de apelaciones.

- Commit: `2fc89ae`
- Cambios:
  - `server/tests/sqliteIntegration.test.js`
  - `server/tests/postgresIntegration.test.js`
  - Nuevo edge case: `openAppeal` concurrente entre dos instancias con distintas `idempotencyKey`; solo una apertura debe persistir y la segunda debe fallar con `appeal_already_open`.

Verificación ejecutada:
- `node --test server/tests/sqliteIntegration.test.js server/tests/postgresIntegration.test.js`
  - SQLite: pass (incluye nuevo test de carrera)
  - Postgres: skip automático sin `DATABASE_URL`

Próxima acción concreta:
- Ejecutar suite Postgres con `DATABASE_URL` para cerrar evidencia de concurrencia + rollback en runtime objetivo.
