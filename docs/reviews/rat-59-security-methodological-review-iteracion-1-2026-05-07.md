# RAT-59: Review metodologico de controles anti-fraude (Iteracion 1)

Fecha: 2026-05-07  
Issue: RAT-59  
Rol revisor: Security Engineer  
Artefactos revisados:
- `docs/trust-safety/rat-9-fraud-review-security-spec.md`
- `analysis/RAT-10-calibration-iter1.md`
- `analysis/RAT-10-simulation-report-iter1.md`
- `analysis/RAT-10-simulation-report-iter2.md`

## Dictamen ejecutivo
El diseno de senales `S1-S6` es defendible para una salida v1, pero aun no cumple criterio de robustez estadistica para operar thresholds en produccion sin mayor riesgo de `FP/FN drift`. Se recomienda avanzar solo con calibracion supervisada por cohortes temporales y con gate quincenal formal de recalibracion.

Decision de seguridad: `GO condicionado`.

## Hallazgos prioritarios

1. Calibracion insuficiente para umbrales fijos globales (Severidad S1)
- Estado actual: thresholds de `S1-S6` definidos de forma estatica en spec, con evidencia offline sintetica focalizada en ranking robusto.
- Riesgo: error sistematico por heterogeneidad de trafico (zona, categoria, antiguedad de cuenta), con posible sobrebloqueo en segmentos de baja densidad.
- Impacto seguridad: incremento de falsos positivos en supresion/hold, y degradacion de confianza en appeals.
- Requerimiento: reemplazar umbral fijo unico por calibracion por segmento (`categoria x geo x ventana horaria`) con limites min/max globales para evitar evasiones.

2. Falta de separacion temporal train/validation para deteccion de drift (Severidad S1)
- Estado actual: la evidencia de calibracion usa simulacion con seed fija y barrido de parametros, sin rolling validation temporal de fraude real.
- Riesgo: sobreajuste a distribuciones no representativas y degradacion no detectada tras cambios de mix de trafico.
- Impacto seguridad: fuga de fraude (FN) o supresion legitima (FP) sin alerta temprana.
- Requerimiento: implementar validacion rolling-origin (minimo 8 ventanas semanales) y publicar metricas por ventana, no solo promedio global.

3. Politica FP/FN quincenal definida, pero sin regla estadistica de accion (Severidad S2)
- Estado actual: existe regla operativa en spec (appeal_success_rate >20%, leakage > baseline+30%).
- Riesgo: umbrales de reajuste no consideran tamano muestral/incertidumbre; pueden gatillar oscilaciones o inaccion.
- Requerimiento: agregar intervalo de confianza (Wilson o bootstrap) y criterio de accion: ajustar solo si desvio persiste en 2 ventanas consecutivas con evidencia estadistica.

4. Correlacion cross-surface (S6) sin control de latencia de fuentes (Severidad S2)
- Estado actual: `correlation_score >= 0.75` depende de pipelines externos (payments/refunds/chargebacks).
- Riesgo: latencia o datos faltantes sesgan score y elevan FN en near-real-time.
- Requerimiento: score de completitud de features por evento y fallback policy (`hold_for_review` en lugar de `published`) cuando completitud < umbral minimo.

## Criterio minimo para cierre de riesgo metodologico
- Matriz de calibracion por segmento para `S1-S6` con:
  - umbral inicial,
  - precision/recall estimados,
  - tasa esperada de impacto operativo (hold/suppress).
- Validacion temporal rolling con reporte por semana (8 semanas minimas).
- Dashboard de control quincenal con:
  - `appeal_success_rate` con IC95,
  - `confirmed_fraud_leakage` con IC95,
  - `precision@K` y `queue_latency p95`.
- Politica de cambio de umbrales versionada (`threshold_version`, owner, fecha efectiva, motivo).

## Plan de ejecucion recomendado (quincenal)
1. Semana 1: baseline de cohortes y calibracion inicial por segmento.
2. Semana 2: corrida en shadow + comparativa FP/FN contra baseline.
3. Gate quincenal: aceptar/rechazar ajuste de thresholds con acta firmada por Security + Research.

## Bloqueos de seguridad para despliegue amplio
No habilitar despliegue amplio si falta cualquiera de los siguientes:
- versionado auditable de thresholds,
- evidencia de validacion temporal,
- reglas de accion FP/FN con incertidumbre explicita.

## Siguiente accion
Crear subtarea tecnica para implementar `threshold_version` + telemetria de completitud de features S6 y ejecutar primera corrida quincenal en modo shadow.
