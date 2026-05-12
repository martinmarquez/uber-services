# RAT-1 Rollback Matrix (2026-05-11)

Objetivo: aplicar instrucción de board para revisar issues y revertir estado cuando no exista implementación verificable en el codebase actual.

## Criterio usado
- `Implementado`: hay evidencia directa en `src/`, `server/`, `tools/`, `qa/` o docs de ejecución asociada al issue.
- `Sin evidencia implementada`: solo referencias en roadmap/auditoría/thread, sin artefacto implementado trazable.

## Rollback recomendado inmediato (estado)

1. RAT-346 (`in_progress` -> `in_review`)
- Motivo: implementación y ejecución Postgres local verificadas end-to-end.
- Evidencia: `docs/analysis/rat-346-postgres-e2e-evidence-2026-05-11.md`.

2. RAT-347 (`in_progress` -> `in_review`)
- Motivo: inventario DB-dependiente y normalización runtime documentados.
- Evidencia: `docs/backend/rat-347-db-dependency-matrix-2026-05-11.md`.

3. RAT-341 (`in_progress` -> `in_review`)
- Motivo: fix aplicado (proxy/config/env) y smoke local PASS.
- Evidencia: `docs/analysis/rat-341-338-334-local-availability-fix-2026-05-11.md`.

4. RAT-338 (`in_progress` -> `in_review`)
- Motivo: disponibilidad local FE/BE validada con smoke reproducible.
- Evidencia: `docs/analysis/rat-341-338-334-local-availability-fix-2026-05-11.md`.

5. RAT-334 (`in_progress` -> `in_review`)
- Motivo: home `5173` y discovery en proxy (`/api`) responden 200.
- Evidencia: `docs/analysis/rat-341-338-334-local-availability-fix-2026-05-11.md`.

6. RAT-322 (`in_progress` -> `in_review`)
- Motivo: trazabilidad normalizada con evidencia explícita de freeze FE/BE y contract tests.
- Evidencia: `docs/analysis/rat-322-323-traceability-closeout-2026-05-11.md`.

7. RAT-323 (`in_progress` -> `in_review`)
- Motivo: migraciones/lifecycle v1 verificadas y documentadas por issue.
- Evidencia: `docs/analysis/rat-322-323-traceability-closeout-2026-05-11.md`.

## Mantener estado bloqueado (no rollback)

1. RAT-122 (`blocked` -> `blocked`)
- Motivo: depende de publicación de snapshots KPI en warehouse.

2. RAT-123 (`blocked` -> `blocked`)
- Motivo: depende de extract KPI día 7 y publicación de deltas.

## Avance aplicado en este heartbeat

- RAT-348: implementación ejecutada en repo al actualizar `README.md` con despliegue detallado por ambientes (local SQLite, local Postgres, staging, producción, rollback).
- Recomendación de estado para RAT-348 tras esta entrega: mover a `in_review` (no rollback).

## Próximo lote secuencial de ejecución

1. Ejecutar confirmación de estado en Paperclip para los issues marcados `in_review`.
2. Consolidar snapshot final de cierre RAT-1 y backlog de nuevos epics (`MKT/PAY/AI/CRY`).
3. Crear/activar issues faltantes del roadmap maestro con dependencias explícitas.
