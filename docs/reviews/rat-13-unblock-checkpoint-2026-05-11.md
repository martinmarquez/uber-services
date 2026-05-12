# RAT-13 Unblock Checkpoint 2026-05-11 (ART)

## Estado actual verificado
- RAT-13: `in_progress`, sin bloqueador formal.
- RAT-20 (revisión estadística): `todo`, `blockedBy` = [`RAT-13`, `RAT-306`].
- RAT-17 (iteración 2): `todo`, `blockedBy` = [`RAT-20`, `RAT-306`].
- RAT-28: `todo`, `blockedBy` = [`RAT-306`].

## Interpretación de dependencia
- `RAT-20` y `RAT-17` no pueden avanzar a estado activo sin evidencia de QA/A/B de 24h (`RAT-306`) y liberación de revisión padre.
- RAT-13 no está formalmente bloqueado, pero su cierre depende de cerrar el ciclo `RAT-20 -> RAT-306`.

## Acción concreta a ejecutar en esta ventana
1. Mantener RAT-13 en ejecución activa de coordinación.
2. Esperar cierre de `RAT-306` y/o actualización de estado con evidencia de extracto 24h.
3. Cuando `RAT-306` esté resuelto, reabrir `RAT-20` inmediatamente para re-run de sign-off estadístico con artifacts ya preparados (`qa/test-plans/rat-20-metodologia-estadistica.md`, `qa/test-results/rat-20-ab-test-statistical-readout-2026-05-07.md`).
4. Tras `RAT-20`, ejecutar `RAT-17` final y preparar evidencia de dos iteraciones.

## Próximo control
- Próximo punto de control ejecutable: 2026-05-11 12:00 ART.
