# RAT-23: Review de supuestos estadísticos (RAT-10 scoring)

Fecha: 2026-05-06  
Issue: RAT-23  
Documento revisado: `RAT-10-ranking-robusto.md`

## Resumen ejecutivo
El diseño propuesto es sólido para robustecer ranking contra `small-N` y fraude, pero hay 4 riesgos estadísticos que hoy impiden interpretar causalmente el A/B y garantizar calibración estable del score. Se recomienda avanzar a implementación solo si se agregan las correcciones de este documento.

## Hallazgos críticos

1. Interferencia entre unidades en A/B (S1)
- Estado actual: unidad de randomización propuesta = sesión de búsqueda.
- Riesgo: el ranking y la reputación afectan oferta y demanda de múltiples sesiones/usuarios simultáneamente (network effects), violando SUTVA.
- Impacto: sesgo en estimación de uplift de conversión y completion; el efecto puede aparecer inflado o diluido por contaminación entre tratamientos.
- Recomendación: randomizar por `geo x time bucket` (switchback) o por clúster de mercado/categoría, no por sesión individual.

2. Métrica primaria sin guardrails inferenciales explícitos (S1)
- Estado actual: menciona KPIs primarios/ secundarios y monitoreo Pocock, pero no define familia de hipótesis ni control de error por múltiples cortes/KPIs.
- Riesgo: inflación de falsos positivos (alpha spending descontrolado) con múltiples endpoints + miradas secuenciales.
- Recomendación:
  - Definir KPI primario único para decisión go/no-go (ej. completion rate).
  - Registrar jerarquía de tests (gatekeeping): primario -> seguridad (refund/claim) -> secundarios.
  - Fijar alpha total 0.05 con frontera secuencial predefinida por número de looks.

3. Calibración de hiperparámetros sin separación train/validation temporal (S1)
- Estado actual: grid search `m,k,gamma` y ajuste fino por categoría.
- Riesgo: sobreajuste al histórico y drift no detectado; degradación en producción.
- Recomendación:
  - Validación rolling-origin (time split) con ventanas por semana/mes.
  - Reportar distribución de performance por cohorte temporal, no solo promedio.
  - Congelar parámetros por release y reentrenar con cadencia fija (ej. mensual) bajo changelog.

4. Factorización multiplicativa no calibrada de incertidumbre (S2)
- Estado actual: `S = 100 * Q_bayes * F_volume * F_recency * F_reliability * F_incident`.
- Riesgo: mezcla de penalizaciones puede generar doble castigo en colas (ej. bajo volumen + incidente) y pérdida de monotonicidad percibida.
- Recomendación:
  - Test de monotonicidad parcial por dimensión (manteniendo otras constantes).
  - Calibrar escala final con isotonic regression o spline monotónica para mapear score a probabilidad de outcome deseado.

## Hallazgos medios

5. `m=25` global puede inducir sesgo por categoría (S2)
- Riesgo: categorías con baja frecuencia requieren prior distinto para evitar shrinkage excesivo.
- Recomendación: prior jerárquico por categoría/ciudad con pooling parcial.

6. Half-life fijo de 120 días (S3)
- Riesgo: dinámica de servicios heterogénea; recencia óptima difiere entre verticales.
- Recomendación: estimar `lambda` por vertical con restricciones de estabilidad (rango permitido).

7. Métricas offline sin banda de incertidumbre (S3)
- Riesgo: decisiones por diferencias pequeñas no significativas.
- Recomendación: bootstrap por proveedor y por semana para IC95% en NDCG, Kendall tau y volatilidad.

## Criterio mínimo para aprobar RAT-10C

- Diseño experimental actualizado a switchback o clúster.
- Plan inferencial escrito: hipótesis primaria, familia, alpha spending y reglas de stop.
- Validación temporal rolling con reporte de variabilidad entre periodos.
- Chequeo de calibración + monotonicidad del score final.

## Siguiente acción recomendada
1. Owner técnico RAT-10 actualiza diseño de experimento y plan de inferencia.
2. Data crea template de reporte con IC95% y tabla de decisiones go/no-go.
3. Se reabre revisión rápida para aprobar release candidate del scoring.
