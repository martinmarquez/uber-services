# RAT-39 Readout operativo D+2 y D+7

Fecha: 2026-05-11  
Owner: Data + CS

Fuente del tablero:
- SQL base: `analysis/sql/rat-39-cs-dashboard-operational-view.sql`
- Vista publicada en warehouse: `public.rat39_cs_dashboard_operational_v1`
- SQL de publicacion (Neon schema): `analysis/sql/rat-39-cs-dashboard-operational-view-neon.sql`

## Checkpoint operativo (2026-05-11)

Evidencia de publicacion:
- `CREATE VIEW public.rat39_cs_dashboard_operational_v1` ejecutado OK.
- Conteo actual de filas en vista: `0`.
- Estado runtime: credenciales y cliente SQL operativos al momento de ejecucion.

Lectura ejecutiva:
- El tablero queda publicado y auditable.
- Aun no hay datos de eventos/tickets/apelaciones/incidentes en tablas fuente para poblar metricas.
- Riesgo actual: baja cobertura de observabilidad por ausencia de ingestion, no por falla de instrumentacion.

## Heartbeat RAT-785 (2026-05-11 07:02 ART / 2026-05-11T10:02:49Z)

Verificacion ejecutada contra runtime warehouse activo:
- `public.analytics_events`: `0` filas
- `public.analytics_events_archive`: `0` filas
- `public.conversation`: `0` filas
- `public.inquiry`: `0` filas
- `public.kpi_snapshot_daily`: `0` filas

Resultado:
- Aun no hay source data no vacia para poblar el primer corte D+2/D+7 de RAT-39.
- Se mantiene estado `amarillo` por dependencia de ingestion (Data Platform/Analytics Engineering).

## Corte D+2 (primer corte real pendiente de datos)

- Fecha de release: pendiente confirmacion producto.
- Fecha de corte D+2: pendiente.
- Estado general: amarillo (infra lista, data no disponible).

| Metrica | Valor D+2 | Tendencia vs baseline | Semaforo | Riesgo |
|---|---:|---|---|---|
| review_submit_completion_rate | n/a | n/a | amarillo | sin eventos fuente |
| review_flow_dropoff_after_star_select | n/a | n/a | amarillo | sin eventos fuente |
| support_tickets_review_status_confusion | n/a | n/a | amarillo | sin tickets fuente |
| appeal_reopen_rate | n/a | n/a | amarillo | sin eventos de apelacion |
| exec_watch_incidents | n/a | n/a | amarillo | sin incidentes fuente |

Accion ejecutada:
- Publicar vista operacional en warehouse y dejar readout trazable para completar en cuanto exista data.

## Corte D+7 (pendiente de datos)

- Fecha de corte D+7: pendiente.
- Estado general: pendiente.
- Decision recomendada: completar cuando ingrese data operacional.

## Gate de escalamiento Board

Escalar a Board si se cumple cualquiera:
- `review_submit_completion_rate` cae >=10% relativo por 2 dias.
- `exec_watch_incidents` incumple SLA de escalamiento a CEO (<4h).
- Proyeccion de impacto en retencion/MRR trimestral.
