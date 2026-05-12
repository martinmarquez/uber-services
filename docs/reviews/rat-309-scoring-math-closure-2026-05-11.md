# RAT-309 / RAT-22A - Cierre tecnico de spec matematica de scoring

Fecha: 2026-05-11  
Owner: CTO  
Estado: `READY_TO_CLOSE`

## Alcance cerrado
- Formula final de `I_sev` (agregacion + cap global + decay).
- Contrato final de `F_recency` con rango publicado exacto.
- Eliminacion de contradicciones entre documento, backend y QA matrix.

## Evidencia por criterio de aceptacion
1. Spec unica versionada con formulas deterministicas: PASS
- `RAT-10-ranking-robusto.md` fija `ranking_robust_v1.1` y formulas canonicas.

2. Ejemplos numericos reproducibles para casos borde: PASS
- Spec incluye casos de borde para `F_recency` (`R_rec=1`, `R_rec=5`) y `I_sev` (sin incidentes, multi-incidente, cap global).

3. Checklist QA de consistencia formula publicada vs ejecutada: PASS
- Checklist creado y verificado en `docs/backend/QA/rat-309-formula-consistency-checklist.md`.
- QA matrix actualizada en RR-03/RR-07/RR-08.
- Manifest template actualizado con `incident_aggregation` deterministica y versionado alineado.

## Artefactos de cierre
- `RAT-10-ranking-robusto.md`
- `server/src/domain/reviewService.js`
- `server/tests/reviewService.test.js`
- `qa/test-plans/ratings-reviews-test-matrix.md`
- `qa/test-results/rat-24-rat-10d-run-manifest-template.json`
- `docs/backend/QA/rat-309-formula-consistency-checklist.md`

## Verificacion minima
- `node --test server/tests/reviewService.test.js` -> PASS (21/21).

## Proxima accion
- Cerrar `RAT-309` como `done` con este paquete de evidencia.
