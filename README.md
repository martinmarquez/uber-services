# Uber Services MVP

MVP de marketplace de servicios locales (discovery, booking, reseñas, moderación y analítica de confianza).

## Stack
- Frontend: React + Vite (`src/`)
- Backend/API: Node.js (`server/`)
- DB: SQLite para desarrollo rápido + PostgreSQL para integración
- QA: Vitest + suites en `server/tests` y `src/**/*.test.*`

## Requisitos
- Node.js 20+
- npm 10+

## Variables de entorno

### Frontend
- `VITE_API_BASE_URL` (default: `/api`)

### Backend
- `PORT` (default: `5178`)
- `DATABASE_URL` (ejemplo local Postgres: `postgresql://postgres:postgres@localhost:5432/uber-services`)
- `SQLITE_PATH` (default local: `server/.data/reviews-dev.sqlite`)
- `ACTOR_SIGNING_SECRET` (requerido para validar headers firmados en endpoints protegidos)

## Entornos

## Ownership de deployment (RAT-701)
- Owner de CI/CD, containerización, automatización de deploy y health gates: **DevOps Engineer**.
- Fuente canónica de estrategia y estado de infraestructura: `DEPLOY_CONFIG.md`.
- Gate de recursos infra: requiere `PRODUCT_BRIEF.md` con scope + timeline.
- Escalación obligatoria al CTO board: cambios de presupuesto infra y decisiones de dominio/DNS.

## 1) Desarrollo local rápido (SQLite)
1. Instalar dependencias:
```bash
npm install
```
2. Levantar frontend + backend en una sola terminal:
```bash
npm run dev:full
```
3. Alternativa en dos terminales:
Terminal A:
```bash
npm run dev
```
Terminal B:
```bash
npm run server:start
```
4. Abrir `http://localhost:5173`.

Notas:
- Para preparar SQLite local:
```bash
node server/src/db/runSqliteMigrations.js server/.data/reviews-dev.sqlite
```

## 2) Desarrollo/integración local con PostgreSQL
1. Levantar Postgres local (ejemplo Docker):
```bash
docker run --name uber-services-pg -e POSTGRES_PASSWORD=postgres -e POSTGRES_DB=uber-services -p 5432:5432 -d postgres:16
```
2. Exportar variables:
```bash
export DATABASE_URL='postgresql://postgres:postgres@localhost:5432/uber-services'
export ACTOR_SIGNING_SECRET='dev-only-secret'
```
3. Ejecutar migraciones:
```bash
node server/src/db/runPostgresMigrations.js "$DATABASE_URL" rat_mvp
```
4. Levantar backend y frontend.

## 3) Staging
Objetivo: validar release candidato con paridad productiva.

Checklist:
1. Build frontend:
```bash
npm run build
```
2. Ejecutar tests críticos:
```bash
npm run test
node --test server/tests/*.test.js
```
3. Aplicar migraciones de backend contra DB de staging.
4. Configurar secretos vía gestor seguro (no commitear `.env`).
5. Publicar frontend (`dist/`) y backend con healthcheck activo.
6. Verificar smoke:
- carga de discovery
- creación de booking
- creación/moderación de reseña
- report/response de reseña

## 4) Producción
Objetivo: despliegue seguro con rollback.

Estrategia recomendada:
1. Pre-deploy
- freeze de schema changes
- backup/snapshot de DB
- validar migraciones forward-only en réplica/staging
2. Deploy
- backend primero, luego frontend
- activar flags graduales si existen
3. Post-deploy (primeros 30-60 min)
- monitorear errores API 5xx/4xx críticos
- monitorear tasa de fallas de discovery/booking/review
4. Rollback
- si hay regresión funcional severa: rollback de app a versión previa
- si hay migración incompatible: ejecutar plan de contingencia definido antes del release

## Comandos útiles
- Frontend dev: `npm run dev`
- Backend dev: `npm run server:start`
- Frontend+Backend dev: `npm run dev:full`
- Build: `npm run build`
- Preview build: `npm run preview`
- Test frontend clave: `npm run test`
- Migrate SQLite: `npm run db:migrate:sqlite`
- Migrate Postgres: `npm run db:migrate:postgres`
- Smoke disponibilidad local (FE+BE+proxy discovery): `npm run smoke:local`

## Estado del roadmap
- Plan maestro: `plans/master-plan-rat-1-2026-05-06.md`
- Roadmap ejecutivo: `ROADMAP.md`
