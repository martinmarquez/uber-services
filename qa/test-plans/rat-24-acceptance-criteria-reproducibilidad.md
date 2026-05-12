# RAT-24 - Acceptance Criteria QA de reproducibilidad (RAT-10D)

Fecha: 2026-05-06
Issue: RAT-24
Dependencia principal: RAT-10

## Cierre PASS (todos obligatorios)
- [ ] Existe `run_manifest.json` completo con campos mínimos definidos en `qa/test-results/rat-24-rat-10d-run-manifest-template.json`.
- [ ] Snapshot de datos congelado con `data_cutoff_utc` + `dataset_hash_sha256` verificable.
- [ ] Baseline formal versionado (`baseline_id` + commit) y consistente con la corrida.
- [ ] Parámetros efectivos de scoring serializados y hashados (`params_hash_sha256`).
- [ ] Definición determinística de `I_sev` (función + cap + decay) implementada en el manifest.
- [ ] Checklist de consistencia publicada-vs-ejecutada completo: `docs/backend/QA/rat-309-formula-consistency-checklist.md`.
- [ ] Validaciones de calidad de muestra en PASS: SRM, logging completeness, deduplicación.
- [ ] Tabla de métricas y memo de decisión adjuntos al issue.
- [ ] Rerun independiente reconstruye mismos resultados dentro de tolerancia numérica definida.

## Cierre BLOCKED
Si falta cualquier ítem PASS, el gate permanece BLOCKED y debe indicarse:
- Unblock owner
- Unblock action
- Evidencia faltante exacta
