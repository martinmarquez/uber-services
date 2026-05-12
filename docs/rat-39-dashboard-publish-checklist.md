# RAT-39 Dashboard Publish Checklist

Fecha: 2026-05-07  
Owner funcional: Data Analyst (RAT-39)

## Alcance de publicacion

Objetivo: publicar tablero operativo CS con 5 metricas, filtros minimos y semaforo de alertas.

Artefactos de base:
- `analysis/sql/rat-39-cs-dashboard-metrics.sql`
- `analysis/sql/rat-39-cs-dashboard-operational-view.sql`
- `docs/rat-39-dashboard-readout-dia2-dia7.md`

## Checklist tecnico

1. Crear/actualizar vista materializada diaria desde `rat-39-cs-dashboard-operational-view.sql`.
2. Conectar datasource en herramienta BI oficial del equipo.
3. Crear tablero "RAT-39 CS Friccion y Churn" con 5 widgets:
- completion rate
- dropoff post-star
- support confusion
- appeal reopen rate
- exec-watch incidents
4. Aplicar filtros globales:
- tipo usuario
- cohorte nuevos/recurrentes
- canal
- rating bucket
5. Configurar semaforo por metrica con thresholds:
- red / yellow / green segun regla en SQL
6. Configurar alerta diaria 09:00 ART para estado red.
7. Validar data latency (<15 min operativo, <24h cierre diario).

## Checklist de auditoria

1. Trazabilidad: cada widget debe apuntar a la vista operacional unificada.
2. QA de metrica: comparar 1 dia aleatorio entre tabla base y widget.
3. Documentar resultado en `docs/rat-39-dashboard-readout-dia2-dia7.md`.

## Criterio para cerrar RAT-39

- Dashboard visible para CS y auditable.
- Primer readout D+2 o D+7 cargado con datos reales y decision operativa.
- Sin alertas rojas sin owner asignado.
