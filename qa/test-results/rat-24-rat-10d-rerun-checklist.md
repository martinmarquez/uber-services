# RAT-24 / RAT-10D - Checklist de rerun reproducible

Fecha: 2026-05-06
Scope: evidencia minima para pasar QA de reproducibilidad

## Pre-run
- [ ] Congelar commit de codigo y registrar `git_commit`.
- [ ] Confirmar `seed_version` y `seed_value` canónicos.
- [ ] Definir `data_cutoff_utc` y generar snapshot con hash SHA-256.
- [ ] Fijar `baseline_id` + commit del baseline.
- [ ] Publicar contrato de agregacion de incidentes (`function`, `cap`, `decay_rule`).

## Run
- [ ] Ejecutar simulacion offline con semilla fija.
- [ ] Ejecutar lectura A/B con ventana temporal definida.
- [ ] Correr chequeos de calidad: SRM, logging completeness, deduplicacion.
- [ ] Registrar parametros efectivos y `params_hash_sha256`.

## Post-run (artefactos obligatorios)
- [ ] Completar `qa/test-results/rat-24-rat-10d-run-manifest-template.json`.
- [ ] Exportar tabla de metricas con CI y p-values ajustados.
- [ ] Adjuntar decision memo PASS/BLOCKED con riesgos remanentes.
- [ ] Referenciar todos los URIs/hashes en comentario del issue RAT-24.

## Criterio de cierre QA
PASS solo si el rerun puede reconstruirse end-to-end sin supuestos fuera del manifest.
