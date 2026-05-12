# RAT-24 / RAT-10D - Review QA de reproducibilidad (Iteracion 1)

Fecha: 2026-05-06
Issue: RAT-24
Scope: QA de reproducibilidad de la linea de scoring `RAT-10-ranking-robusto.md`
Dependencias revisadas: `qa/test-plans/rat-20-metodologia-estadistica.md`, `qa/reviews/rat-27-rating-360-spec-qa-review-iteracion-1.md`

## Decision de gate
BLOCKED para cierre QA de reproducibilidad hasta completar contratos minimos de repetibilidad y auditoria.

## Objetivo del review
Confirmar que los resultados de simulacion offline y lecturas A/B del score robusto puedan repetirse de forma deterministica por cualquier reviewer tecnico.

## Checklist de reproducibilidad

1. Semilla global versionada
- Estado: FAIL
- Hallazgo: `RAT-10-ranking-robusto.md` exige "seed" en entregables, pero no define valor canónico ni politica de rotacion.
- Riesgo: dos corridas con mismos datos pueden divergir.
- Requerido para PASS: fijar `seed_version` y almacenamiento en artefacto de corrida.

2. Snapshot de datos congelado
- Estado: FAIL
- Hallazgo: se pide snapshot, pero no hay contrato de corte temporal, timezone ni esquema minimo de columnas.
- Riesgo: drift de datos entre corridas invalida comparaciones.
- Requerido para PASS: contrato de snapshot con `data_cutoff_utc`, hash de dataset y ubicacion de storage.

3. Baseline formal versionado
- Estado: FAIL
- Hallazgo: criterio "vs baseline naive average" sin version/pipeline formal.
- Riesgo: no auditabilidad de metricas de mejora (NDCG, over-ranking reduction).
- Requerido para PASS: `baseline_id` inmutable y definicion del pipeline de referencia.

4. Contrato de parametros de scoring
- Estado: PARTIAL
- Hallazgo: existen parametros iniciales (`C,m,k,lambda,gamma`) pero falta contrato de serializacion por corrida.
- Riesgo: cambios silenciosos de parametros contaminan comparativas.
- Requerido para PASS: registrar `params_json` por corrida + hash.

5. Definicion deterministica de incidentes
- Estado: FAIL
- Hallazgo: `I_sev` continua ambiguo en agregacion (suma/max/EWMA/caps).
- Riesgo: salidas no deterministas entre implementaciones.
- Requerido para PASS: funcion formal + caps + regla de decay.

6. Trazabilidad A/B y calidad de muestra
- Estado: PARTIAL
- Hallazgo: `rat-20-metodologia-estadistica.md` define SRM e integridad, pero no existe template de "run manifest" unico por lectura.
- Riesgo: dificultad para reconstruir lecturas y decisiones de gate.
- Requerido para PASS: manifiesto por corrida con IDs de experimento, ventana temporal, exclusiones y p-values ajustados.

## Evidencia minima exigida para desbloquear RAT-24
- `run_manifest.json` por corrida con: `run_id`, `seed_version`, `data_cutoff_utc`, `dataset_hash`, `baseline_id`, `params_hash`, `git_commit`.
- Tabla de resultados reproducible (metricas primarias/secundarias + CIs + ajuste Holm-Bonferroni).
- Registro de validaciones de calidad de datos: SRM, logging completeness, deduplicacion.
- Decision memo PASS/BLOCKED con referencia al manifiesto y artefactos.

## Propuesta de formato (contrato minimo)
```json
{
  "run_id": "rat10d-2026-05-06T22:00:00Z",
  "seed_version": "seed-v1-2026Q2",
  "data_cutoff_utc": "2026-05-05T23:59:59Z",
  "dataset_hash": "sha256:<hash>",
  "baseline_id": "naive-average-v1",
  "params_hash": "sha256:<hash>",
  "git_commit": "<commit>",
  "experiment_ids": ["exp_rat10_ab_v1"],
  "exclusions": {
    "fraud_confirmed_removed": true,
    "bot_filter_version": "bot-filter-v2"
  }
}
```

## Riesgo de negocio y criterio de escalacion
Escalar a Board si en tres cortes consecutivos se observa simultaneamente:
- `refund_claim_rate` en deterioro sostenido, y
- `booking_conversion_rate` con delta negativo material (>1.5% relativo).

## Siguiente accion
Solicitar al owner tecnico de scoring (RAT-10) la publicacion del contrato de reproducibilidad (manifest + baseline + snapshot policy) y luego ejecutar una segunda iteracion QA contra ese contrato.
