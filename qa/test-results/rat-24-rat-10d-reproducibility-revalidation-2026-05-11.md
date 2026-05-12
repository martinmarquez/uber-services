# RAT-24 / RAT-10D - Revalidacion QA de reproducibilidad (2026-05-11)

Fecha: 2026-05-11
Issue: RAT-24
Owner QA: QA Specialist

## Objetivo
Revalidar en heartbeat actual que la evidencia de reproducibilidad sigue siendo ejecutable end-to-end para simulacion offline sintetica.

## Evidencia base auditada
- `qa/test-results/rat-24-rat-10d-run-manifest-2026-05-06.json`
- `qa/test-results/rat-24-rat-10d-rerun-readout-2026-05-06.md`
- `analysis/rat10_simulation.py`

## Ejecucion reproducible (doble corrida)
Comandos:
```bash
python3 analysis/rat10_simulation.py > /tmp/rat24_run1.txt
python3 analysis/rat10_simulation.py > /tmp/rat24_run2.txt
diff -u /tmp/rat24_run1.txt /tmp/rat24_run2.txt
```

Resultado:
- `diff`: sin diferencias (`NO_DIFF`)
- Seed observada en output: `seed 42`
- Salida observada coincide con snapshot de `qa/test-results/rat-24-rat-10d-rerun-readout-2026-05-06.md`

## Verificacion de criterios de reproducibilidad
- Seed control (`seed_version` + `seed_value` + `seed_scope`): PASS
- Dataset versioning (`data_cutoff_utc` + `dataset_hash_sha256` + `schema_version`): PASS
- Trazabilidad de parametros (`params_version` + `params_json` + `params_hash_sha256`): PASS
- Checklist de rerun reconstruible sin supuestos externos: PASS

## Gate QA
PASS (alcance: simulacion offline sintetica RAT-10D).

## Riesgos remanentes
- N/A para alcance offline.
- Validaciones de muestra/telemetria en produccion A/B siguen fuera de alcance de RAT-24 (dependen de RAT-28/RAT-20).

## Next action
Handoff a integracion final: tomar este paquete de evidencia QA y cerrar ciclo de integracion en el issue padre.
