# RAT-4 — Rating Research: benchmark global + requisitos para Argentina

Fecha: 2026-05-06

## 1) Benchmark global (5 plataformas)
Plataformas incluidas: Airbnb, Uber, Yelp, Apple App Store, Google Play.

### Evidencia base verificada
- Airbnb mantiene ventana de 14 días y publicación diferida (se publica cuando ambas partes envían o al vencer 14 días). Fuente: https://www.airbnb.com/help/article/13
- Política de reseñas de Airbnb prohíbe coerción/incentivos/manipulación de reseñas. Fuente: https://www.airbnb.com/help/article/3048
- Uber usa feedback anónimo y doble vía de rating. Fuente: https://help.uber.com/en-GB/riders/article/understanding-driver-ratings?nodeId=fa1eb77f-ad79-4607-9651-72b932be30b7
- Yelp separa reseñas “recommended” y “not recommended”; las no recomendadas no impactan rating agregado. Fuente: https://www.yelp-support.com/article/Does-Yelp-recommend-every-review?l=en_GB
- Apple permite responder reseñas y reportar reseñas ofensivas/spam desde App Store Connect. Fuente: https://developer.apple.com/app-store/ratings-and-reviews/
- Google Play prohíbe reseñas/ratings incentivadas o fraudulentas y desaconseja pedir mejor calificación al responder. Fuente: https://support.google.com/googleplay/android-developer/answer/9898684?hl=en

## 2) Matriz comparativa (30 capacidades)
Escala de costo: Bajo / Medio / Alto
Escala de impacto: Bajo / Medio / Alto

| # | Feature | Benchmark observado | Objetivo de negocio | Riesgo de abuso | Costo | Impacto esperado |
|---|---|---|---|---|---|---|
| 1 | Ventana fija de reseña post-servicio | Airbnb 14 días | Aumentar tasa de review | Reseña impulsiva | Bajo | Alto |
| 2 | Publicación diferida hasta doble envío o timeout | Airbnb | Reducir retaliación | Colusión entre partes | Medio | Alto |
| 3 | Doble vía (cliente↔prestador) | Airbnb/Uber | Señal de confianza bilateral | Uso punitivo | Medio | Alto |
| 4 | Feedback anónimo en baja calificación | Uber | Mejorar seguridad psicológica | Abuso en anonimato | Medio | Alto |
| 5 | Motivos estructurados en ratings bajos | Uber/Play | Diagnóstico operativo | Spam de motivos | Bajo | Alto |
| 6 | Comentario libre opcional | Todas | Contexto cualitativo | Difamación | Bajo | Alto |
| 7 | Separar “recomendadas” y “no recomendadas” | Yelp | Blindar reputación contra fraude | Falsos positivos | Alto | Alto |
| 8 | No incluir no-recomendadas en score principal | Yelp | Evitar manipulación de estrellas | Sesgo algorítmico | Medio | Medio |
| 9 | Re-evaluación continua de confianza de reviews | Yelp | Defender integridad | Opacidad del algoritmo | Alto | Alto |
| 10 | Prohibición explícita de incentivos por reseña | Airbnb/Play | Cumplimiento y credibilidad | Incentivos encubiertos | Bajo | Alto |
| 11 | Prohibición de coerción/amenazas por reseña | Airbnb | Seguridad y reputación | Chantaje cruzado | Bajo | Alto |
| 12 | Moderación post-publicación (reportes) | Airbnb/Apple | Escalar cobertura | Remoción tardía | Medio | Medio |
| 13 | Botón de denuncia de reseña | Apple/Play | Respuesta rápida a abuso | Reporte malicioso | Bajo | Alto |
| 14 | Respuesta pública del proveedor a reseña | Apple/Play/Yelp | Reparación reputacional | Respuesta agresiva | Bajo | Medio |
| 15 | Límite temporal de edición de reseña | Práctica común | Evitar reescritura oportunista | Edición estratégica | Medio | Medio |
| 16 | Auditoría interna de cambios de reseña | Práctica antifraude | Evidencia ante disputas | Complejidad operativa | Medio | Medio |
| 17 | Detección de patrones anómalos (burst, rings) | Play/Yelp (inferencia) | Antifraude proactivo | Falsos positivos | Medio-Alto (MVP-lite) | Alto |
| 18 | Penalización de cuentas con conducta de manipulación | Play (policy) | Disuasión | Evasión por multicuentas | Medio | Alto |
| 19 | “Only verified transaction can review” | Marketplace estándar | Evitar reseña falsa | Compra de cuentas | Medio-Alto | Alto |
| 20 | Umbral mínimo de N ratings para score público estable | Uber sugiere estabilidad >100 | Evitar volatilidad temprana | Penaliza nuevos | Bajo | Medio |
| 21 | Redondeo/control de precisión de score (ej. 4.8) | App stores | Comprensión rápida | Obsesión por décimas | Bajo | Medio |
| 22 | Decaimiento temporal (más peso a reseñas recientes) | Práctica común | Reflejar estado actual | Gaming temporal | Alto | Alto |
| 23 | Segmentación por categoría de servicio | Marketplace estándar | Match de calidad por rubro | Muestras pequeñas | Medio | Alto |
| 24 | Subratings por dimensiones (puntualidad, calidad) | Airbnb-style | Diagnóstico accionable | Inflación de subscore | Medio | Alto |
| 25 | Prompt in-app en momento de valor | Apple/Play prácticas | Mejorar tasa de respuesta | Fatiga de prompts | Bajo | Alto |
| 26 | Frecuencia limitada de prompts | Apple UX norms | Evitar fricción | Baja recolección | Bajo | Medio |
| 27 | Derecho de apelación de remoción | Moderación madura | Fairness para proveedores | Abuso de apelación | Medio | Medio |
| 28 | SLA interno para moderación | Operación trust&safety | Tiempo de respuesta | Backlog operativo | Medio | Alto |
| 29 | Panel de salud reputacional para proveedor | Uber/Play-style insights | Activar mejora continua | Ansiedad por score | Medio | Alto |
| 30 | Runbook de crisis (review bombing) | Play anti-spam signal | Contener daño reputacional | Sobrecorrección | Medio (MVP mínimo) | Alto |

Nota: items marcados como “práctica común/estándar/inferencia” son inferencias de diseño sobre patrones de mercado, no claims explícitos de una plataforma puntual.

## 3) Requisitos y riesgos regulatorios en Argentina

### Marco mínimo aplicable
- Ley 24.240 Defensa del Consumidor (deber de información veraz, trato digno, prevención de prácticas engañosas). Fuente: https://servicios.infoleg.gob.ar/infolegInternet/anexos/0-4999/638/norma.htm
- Decreto 274/2019 (Lealtad Comercial) y normas vinculadas: prohíben publicidad o comunicación engañosa. Referencia Infoleg relacionada: https://servicios.infoleg.gob.ar/infolegInternet/anexos/300000-304999/302907/norma.htm
- Resolución 270/2020 (adopta estándar MERCOSUR de protección al consumidor en e-commerce). Fuente: https://www.argentina.gob.ar/normativa/nacional/resoluci%C3%B3n-270-2020-341933/texto
- Ley 25.326 de Protección de Datos Personales. Fuente: https://servicios.infoleg.gob.ar/infolegInternet/anexos/60000-64999/64790/texact.htm
- Autoridad AAIP y régimen sancionatorio aplicable. Fuente: https://www.argentina.gob.ar/aaip/datospersonales/responsables/acciones/sanciones
- Ley 26.032 (libertad de expresión en internet). Fuente: https://www.argentina.gob.ar/normativa/nacional/ley-26032-107145/texto

### Traducción a decisiones de producto/compliance
- Términos de reseñas deben prohibir contenido falso, difamatorio, discriminatorio y extorsivo.
- Transparencia: explicar qué reseñas impactan score y por qué una reseña puede ocultarse/no recomendarse.
- Debe existir canal de reclamo y revisión humana para remoción/impugnación.
- Política de datos: base legal, minimización, plazos de retención y derechos ARCO (acceso/rectificación/supresión).
- Prohibir explícitamente incentivos por 5 estrellas o sesgo de prompts.
- Mantener trazabilidad/auditoría de moderación y cambios para defensa ante reclamos.

## 4) 15 decisiones priorizadas para MVP (Iteración 2)
1. Reseñas solo para servicios efectivamente completados.
2. Doble vía de rating (cliente y prestador).
3. Ventana de 14 días para enviar review.
4. Publicación diferida tipo Airbnb (doble envío o timeout).
5. Rating 1-5 estrellas + motivos estructurados en <=3 estrellas.
6. Contrato de estados MVP visible en producto: `Verificada`, `En revisión`, `No recomendada`, `Removida`.
7. Separar estado de publicación y estado de impacto en score (solo `Verificada` impacta score).
8. Regla de anonimato MVP para <=3 estrellas: prestador ve señal agregada/tags, no texto libre literal por defecto.
9. Trust Gate v1 con cuarentena de reseñas de riesgo (`En revisión`) sin impacto en score.
10. Señales MVP de riesgo mínimas: burst, cuenta nueva, similitud textual duplicada, patrones de dispositivo/IP/pago.
11. Botón de denunciar reseña + cola de moderación por severidad (P0/P1/P2).
12. SLA de moderación por severidad: 4h/24h/72h (fallback manual mínimo 72h).
13. Flujo de apelación MVP con tracking (`recibida`, `en análisis`, `resuelta`) y motivo estructurado.
14. Historial de auditoría (ledger) para remociones, apelaciones y cambios de score con trazabilidad legal.
15. Runbook anti-review-bombing MVP: freeze temporal de score + recomputación idempotente + rollback operativo.

## 5) 15 decisiones priorizadas para Post-MVP
1. Sistema “recommended vs not recommended” con modelo de confianza tipo Yelp.
2. Detección de anillos de fraude (graph/ring detection).
3. Detección de review bombing en tiempo real.
4. Decaimiento temporal de score (ponderar recencia).
5. Subratings por dimensiones (puntualidad, calidad, comunicación, etc.).
6. Score por categoría de servicio.
7. Reputación por zona geográfica.
8. Dashboard avanzado para prestadores con benchmark percentil.
9. Motor de nudges para mejora de calidad según motivos recurrentes.
10. Moderación híbrida ML + humano con priorización de severidad.
11. Flujo formal de apelaciones multi-etapa.
12. Evidencia adjunta opcional en disputas (foto/chat/recibo).
13. Monitoreo de sesgo y fairness del algoritmo de confianza.
14. Programa de “trusted reviewer” con señales de calidad (sin incentivo económico).
15. Experimentos A/B de prompts y copy para maximizar tasa sin manipulación.

## 6) Recomendación explícita: qué NO implementar en MVP
- No implementar algoritmo opaco “not recommended” desde día 1 (alto riesgo de quejas por falta de explicabilidad).
- No mostrar distribución granular de quién dio cada estrella (riesgo de retaliación).
- No abrir edición ilimitada de reseñas sin ventana temporal.
- No permitir subir multimedia libre sin moderación robusta (costo y riesgo legal alto).
- No introducir gamificación con premios por reseñar (riesgo regulatorio y de manipulación).
- No automatizar remoción final 100% por ML sin revisión humana para casos críticos.

## 7) Trust Gate v1 y contrato operativo MVP

### Contrato de estados y regla de score
- `Verificada`: visible y con impacto en score.
- `En revisión`: visible con etiqueta (opcional), sin impacto en score.
- `No recomendada`: visible con motivo de alto nivel, sin impacto en score.
- `Removida`: no visible públicamente; trazabilidad interna obligatoria.

### Matriz de riesgo -> señal -> mitigación MVP -> owner
| Riesgo no cubierto | Señal primaria | Mitigación MVP | Owner |
|---|---|---|---|
| Farm de cuentas | Cuenta nueva + burst de reseñas | Cuarentena `En revisión` + no impacto de score | Trust & Safety |
| Colusión cliente-prestador | Transacciones repetitivas de bajo monto | Verificación reforzada + cuarentena | Risk/Payments |
| Review bombing por zona/rubro | Pico anómalo en ventana corta | Freeze de score + triage P0 | T&S + Data |
| Flood de apelaciones | Volumen atípico por actor | Rate-limit de apelación + macros | Soporte/T&S |

### NFR mínimos de lanzamiento
- Recomputación de score idempotente cuando una reseña cambia de estado.
- Motivo estructurado obligatorio para toda acción humana/automática.
- Trazabilidad auditable para defensa legal y soporte.

## 8) Riesgos materiales para escalar al board
- Riesgo alto de fraude reputacional coordinado en lanzamiento (impacto directo en conversión).
- Riesgo legal/comercial por prácticas percibidas como engañosas (score sin trazabilidad o prompts sesgados).
- Riesgo de privacidad por mal manejo de datos personales en textos de reseñas y apelaciones.

## 9) Cambios incorporados en Iteración 2 (CTO + PM/UX)
- Sección 2: recalibración de costos en #17, #19 y #30.
- Sección 4: reemplazo de decisiones MVP con contrato de estados, anonimato explícito y trust gate operativo.
- Sección 7: agregado de matriz antifraude accionable con owners y NFR mínimos.
- Decisiones modificadas explícitas:
  - #17 pasa a MVP-lite con heurísticas mínimas (costo Medio-Alto).
  - #19 sube a Medio-Alto por verificación reforzada de cadena de transacción.
  - #30 adelanta runbook mínimo al MVP con freeze/recompute/rollback.

## 10) Checklist de calidad de evidencia (QA-style)
- [x] 5 plataformas mínimas cubiertas.
- [x] >=30 capacidades comparables en matriz.
- [x] 15 decisiones MVP + 15 Post-MVP.
- [x] Sección explícita “NO MVP”.
- [x] Fuentes oficiales enlazadas para políticas núcleo.
- [x] Distinción entre evidencia directa vs inferencia de diseño.
- [x] Revisión técnica CTO (Round 1): ver `docs/rat-34-review-round-1-cto.md`.
- [x] Revisión PM + UX/UI (Round 1): ver `docs/rat-35-review-round-1-pm-ux.md`.
- [x] Iteración 2 con feedback consolidado.
