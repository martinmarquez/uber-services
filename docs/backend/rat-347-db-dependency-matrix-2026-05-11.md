# RAT-347 DB Dependency Matrix (2026-05-11)

Issue: RAT-347  
Objetivo: identificar issues que dependen de DB/runtime y normalizar setup `DATABASE_URL` para ejecución reproducible.

## Runtime target estándar
- `DATABASE_URL=postgresql://postgres:postgres@localhost:5432/uber-services`
- `PG_SCHEMA=public` (o schema aislado por test)
- `PORT=5178`
- `SQLITE_PATH=server/.data/reviews-dev.sqlite` para fallback local rápido

## Dependencias DB por issue (prioridad alta)

### Runtime DB (aplicación backend local)

1. RAT-346 - Implement local postgres as a database for the system
- Dependencia DB: crítica (bloqueante)
- Evidencia requerida para cerrar:
  - Postgres local levantado
  - migraciones aplicadas con `db:migrate:postgres`
  - smoke API con `DATABASE_URL` activo
  - comandos:
    - `npm run db:local:postgres:up`
    - `export DATABASE_URL='postgresql://postgres:postgres@localhost:5432/uber-services'`
    - `export PG_SCHEMA='public'`
    - `npm run db:migrate:postgres`
    - `node --test server/tests/postgresIntegration.test.js`

2. RAT-347 - Review all issues that need access to the DB and setup DATABASE_URL
- Dependencia DB: crítica (meta-issue)
- Evidencia requerida para cerrar:
  - esta matriz publicada
  - comandos de setup en README
  - checklist de issues dependientes actualizado

3. RAT-8 - Implement review domain API and persistence path
- Dependencia DB: alta
- Evidencia en repo:
  - `server/src/domain/reviewService.js`
  - `server/src/db/postgresReviewRepository.js`
  - `server/tests/postgresIntegration.test.js`
- Comando de verificación:
  - `DATABASE_URL='postgresql://postgres:postgres@localhost:5432/uber-services' node --test server/tests/postgresIntegration.test.js`

4. RAT-323 - RAT-26 Impl migraciones y lifecycle backend reviews v1
- Dependencia DB: alta
- Artefactos relacionados en repo:
  - `server/migrations/*.sql`
  - `server/src/db/runPostgresMigrations.js`
  - `server/src/db/postgresReviewRepository.js`
- Gap: falta trazabilidad explícita de cierre en thread/estado del issue.

5. RAT-322 - freeze contrato API rating 360 FE/BE
- Dependencia DB: media (contrato API depende de estados persistidos)
- Artefactos relacionados:
  - `docs/handoff/rat-324-fe-be-contract-freeze-2026-05-10.md`
  - `server/src/api/routes.js`
- Gap: falta alineación explícita RAT-322 <-> artefactos finales.

6. RAT-341 - error discovery en localhost:5178
- Dependencia DB: media-alta (runtime BE y datos)
- Artefactos relacionados:
  - `server/src/http/server.js`
  - `server/src/domain/discoveryBookingService.js`
- Gap: falta runbook de repro+fix con evidencia de no-regresión.

7. RAT-338 / RAT-334 - localhost no responde / no muestra app
- Dependencia DB: media (principalmente runtime FE/BE)
- Artefactos relacionados:
  - scripts de arranque frontend/backend
  - README de despliegue
- Gap: falta cierre explícito con smoke checklist en issue thread.

### Dependencias de DB externa / warehouse

8. RAT-122 - Ejecutar extract KPI día 7 y publicar deltas
- Dependencia DB: alta (conexion externa `DATABASE_URL` o `PG*`)

9. RAT-123 - RAT-82.1 extracción KPI día 7
- Dependencia DB: alta (conexion externa `DATABASE_URL` o `PG*`)

10. RAT-142 - Ejecutar snapshot de KPIs día 7
- Dependencia DB: alta (conexion externa `DATABASE_URL` o `PG*`)

## Comandos operativos normalizados

```bash
# levantar Postgres local
npm run db:local:postgres:up

# exportar runtime DB
export DATABASE_URL='postgresql://postgres:postgres@localhost:5432/uber-services'
export PG_SCHEMA='public'

# aplicar migraciones Postgres
npm run db:migrate:postgres

# validación base para backend Postgres (no-skip)
DATABASE_URL='postgresql://postgres:postgres@localhost:5432/uber-services' node --test server/tests/postgresIntegration.test.js

# iniciar backend API
npm run server:start

# iniciar frontend
npm run dev
```

## Criterio de cumplimiento RAT-347

Se considera completo cuando:
1. los issues DB-dependientes listados arriba tienen referencia explícita a este documento en thread,
2. cada issue tiene comando mínimo de verificación reproducible,
3. `DATABASE_URL` queda normalizada como contrato operativo en documentación raíz.

### Plantilla de verificación reusable

```bash
export DATABASE_URL='postgresql://postgres:postgres@localhost:5432/uber-services'
export PG_SCHEMA='public'
export ACTOR_SIGNING_SECRET='dev-only-secret'

# bootstrap DB local
npm run db:local:postgres:up

# migraciones + integración Postgres en cadena
npm run db:migrate:postgres
DATABASE_URL="$DATABASE_URL" node --test server/tests/postgresIntegration.test.js

# levantar stack local en modo reproducible
npm run server:start
npm run dev
```

## Próxima ejecución secuencial

1. Ejecutar RAT-346: validar Postgres local + migraciones + smoke.
2. Actualizar estado de issues dependientes con evidencia o rollback según resultado real.
