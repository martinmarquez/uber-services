# RAT-51: Plan de relanzamiento A/B post-cierre RAT-47

Fecha: 2026-05-10
Owner: Growth Strategist (`RAT-51`)
Dependencias cerradas: `RAT-47` (resuelta)
Coord QA: `RAT-28`

## 1) Objetivo y criterio de exito
- Objetivo: relanzar el experimento A/B con trazabilidad completa y guardrails activos.
- Criterio de exito operativo: QA pasa de `HOLD` a `PASS` o `FAIL` accionable en <=24h desde este relanzamiento.

## 2) Hipotesis del relanzamiento
- H1 (activacion): reducir friccion en el flujo verificado aumenta conversion exposicion->accion.
- H2 (calidad): con tracking limpio, la lectura de lift por variante deja de tener ruido de instrumentacion.
- H3 (riesgo): guardrails estables permiten sostener corrida hasta muestra minima sin pausar por dano.

## 3) Checklist de relanzamiento (tracking + guardrails + calendario)

### Tracking (gate obligatorio antes de abrir trafico)
- Evento de exposicion presente en 100% del trafico elegible con `experiment_id`, `variant`, `session_id`, `event_ts`.
- Evento de conversion presente con mismas keys y join 1:1 por `session_id` cuando aplica.
- Nulidad de campos criticos (`experiment_id`, `variant`, `session_id`) < 1%.
- Duplicados por `session_id + event_name + minute_bucket` < 2%.
- Drift de asignacion entre variantes <= +/-5 pp.

### Guardrails
- Error rate tecnico sin degradacion relevante vs baseline.
- Reclamos/refunds/flags sin suba material vs control.
- Latencia de paso UX critico en rango normal.

### Calendario operativo
- T0 (hoy): habilitar relanzamiento y correr query de validacion dia 0.
- T0 + 4h: primer corte de salud (tracking + split + guardrails).
- T0 + 24h: rerun QA coordinado con `RAT-28` y decision `PASS`/`FAIL`.
- T0 + 48h: checkpoint de continuidad o pausa segun guardrails.

## 4) Reglas de experimento y decision gates
- Muestra minima: no declarar ganador/perdedor con menos de 100 muestras totales.
- Gate de gasto: iniciativas > USD 10,000 requieren aprobacion CMO previa.
- Escalacion board: si metas de growth se incumplen 2+ trimestres consecutivos.

## 5) Query diaria de validacion (SRM, nulidad, exposicion->conversion)

Nota: ajustar nombres de tablas/columnas al warehouse productivo.

```sql
WITH exposure AS (
  SELECT
    DATE(event_ts) AS ds,
    experiment_id,
    variant,
    session_id,
    user_id
  FROM analytics.events
  WHERE event_name = 'experiment_exposed'
    AND experiment_id = 'verified_review_relaunch_v1'
    AND event_ts >= DATEADD(day, -7, CURRENT_DATE)
),
conversion AS (
  SELECT
    DATE(event_ts) AS ds,
    experiment_id,
    variant,
    session_id,
    user_id
  FROM analytics.events
  WHERE event_name = 'review_conversion'
    AND experiment_id = 'verified_review_relaunch_v1'
    AND event_ts >= DATEADD(day, -7, CURRENT_DATE)
),
exp_daily AS (
  SELECT
    ds,
    experiment_id,
    variant,
    COUNT(*) AS exposures,
    COUNT(DISTINCT session_id) AS uniq_exposure_sessions,
    SUM(CASE WHEN experiment_id IS NULL OR variant IS NULL OR session_id IS NULL THEN 1 ELSE 0 END) AS null_critical_exposure
  FROM exposure
  GROUP BY 1,2,3
),
conv_daily AS (
  SELECT
    ds,
    experiment_id,
    variant,
    COUNT(*) AS conversions,
    COUNT(DISTINCT session_id) AS uniq_conversion_sessions,
    SUM(CASE WHEN experiment_id IS NULL OR variant IS NULL OR session_id IS NULL THEN 1 ELSE 0 END) AS null_critical_conversion
  FROM conversion
  GROUP BY 1,2,3
),
joined AS (
  SELECT
    e.ds,
    e.experiment_id,
    e.variant,
    e.exposures,
    COALESCE(c.conversions, 0) AS conversions,
    e.null_critical_exposure,
    COALESCE(c.null_critical_conversion, 0) AS null_critical_conversion
  FROM exp_daily e
  LEFT JOIN conv_daily c
    ON e.ds = c.ds
   AND e.experiment_id = c.experiment_id
   AND e.variant = c.variant
),
with_totals AS (
  SELECT
    j.*,
    SUM(exposures) OVER (PARTITION BY ds, experiment_id) AS total_exposures,
    SUM(conversions) OVER (PARTITION BY ds, experiment_id) AS total_conversions
  FROM joined j
)
SELECT
  ds,
  experiment_id,
  variant,
  exposures,
  conversions,
  ROUND(100.0 * exposures / NULLIF(total_exposures, 0), 2) AS exposure_share_pct,
  ROUND(100.0 * conversions / NULLIF(exposures, 0), 2) AS conversion_rate_pct,
  null_critical_exposure,
  null_critical_conversion,
  CASE
    WHEN ABS((100.0 * exposures / NULLIF(total_exposures, 0)) - (100.0 / NULLIF(COUNT(*) OVER (PARTITION BY ds, experiment_id), 0))) > 5 THEN 'SRM_WARNING'
    ELSE 'SRM_OK'
  END AS srm_flag,
  CASE
    WHEN (null_critical_exposure + null_critical_conversion) > 0 THEN 'NULL_WARNING'
    ELSE 'NULL_OK'
  END AS null_flag
FROM with_totals
ORDER BY ds DESC, experiment_id, variant;
```

## 6) Coordinacion QA con RAT-28 (<=24h)
- Enviar resultado del primer corte (T0+4h) con:
  - split por variante,
  - tasa de conversion por variante,
  - flags `SRM` y `NULL`.
- Ejecutar rerun QA en T0+24h con owner de `RAT-28`.
- Cerrar ventana con una de dos salidas:
  - `PASS`: continuar experimento bajo monitoreo diario.
  - `FAIL` accionable: pausar, abrir causa raiz y escalar blocker a CMO.

## 7) Escalaciones
- Bloqueo operativo: asignar a CMO con evidencia (query + timestamp + impacto).
- Decision estrategica: enviar 2-3 opciones con recomendacion.
- Restriccion de recursos: escalar a CMO para priorizacion.

## 8) Proximo paso inmediato
- Publicar este artefacto en el hilo de `RAT-51` y ejecutar corte T0.
