# RAT-784 - Superficie de datos poblada para KPI day-7 (2026-05-11)

Issue: `RAT-784` (`RAT-82.2`)  
Scope: Proveer superficie de datos poblada para readout day-7 de `RAT-40` / `RAT-39`.

## Estado de ejecucion (heartbeat actual)

`BLOCKED` en este workspace para cierre numerico.

## Evidencia tecnica

1. El paquete SQL para readout day-7 existe y esta listo para ejecutar:
- `analysis/sql/rat-82-day7-kpi-delta-readout.sql`

2. La verificacion de disponibilidad de datos runtime indica superficie vacia para serie KPI:
- `docs/analysis/rat-82-runtime-data-availability-check-2026-05-11.md`
- Tablas verificadas sin filas: `public.analytics_events`, `public.analytics_events_archive`, `public.kpi_snapshot_daily`.

3. Consecuencia directa:
- No se pueden computar deltas day-7 para:
  - `support_tickets_review_status_confusion`
  - `review_flow_dropoff_after_star_select`

## Contrato de desbloqueo

Owner desbloqueo: Data Platform / Analytics Engineering.

Accion requerida (exacta):
1. Publicar superficie poblada con series baseline y day-7 para las 2 KPI (canonica o mapping aprobado con prueba de paridad).
2. Adjuntar prueba de conteo de filas por tabla fuente (timestamp ART + query ejecutada).
3. Confirmar `rollout_date` oficial para ventana baseline/eval en thread de `RAT-784`.

## Next action al desbloquear

1. Ejecutar `analysis/sql/rat-82-day7-kpi-delta-readout.sql` con ventanas confirmadas.
2. Publicar tabla final baseline/day7/delta + decision gate (`GO/CLOSE | ADJUST | ESCALATE`).

## Wake continuation (issue_status_changed, 2026-05-11)

El issue reaparecio en `in_progress` sin evidencia nueva de datos poblados.

Accion de control aplicada:
- Se creo child issue `RAT-933` para ejecutar el desbloqueo de superficie poblada y evidencia de conteo.
- Se normalizo `RAT-784` a `blocked` y se verifico relacion de bloqueo efectiva via lectura API: `blockedBy = [RAT-933]`.

Nota tecnica de API:
- En responses, `blockedByIssueIds` retorna `null` aun cuando `blockedBy` incluye el issue bloqueador.
- Para validacion operativa en este lane, usar lectura de `blockedBy` como fuente de verdad.
