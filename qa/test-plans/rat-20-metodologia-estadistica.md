# RAT-20 / RAT-13 — Review Gate: Metodologia estadistica

Fecha: 2026-05-06
Estado: En ejecucion (readout inicial publicado 2026-05-07)
Owner: Data Analyst

## Objetivo del gate
Definir una metodologia estadistica reproducible para aceptar o bloquear el despliegue del ranking robusto (RAT-10) bajo evidencia de A/B test y chequeos de calidad de datos.

## North Star y OKR alignment
- OKR de crecimiento: mejorar conversion de booking sin degradar calidad.
- OKR de confianza: reducir refund/claim rate y señales de abuso.
- Decision gate: solo aprobar rollout si cumple criterios de exito primarios y no rompe guardrails.

## Diseno experimental
- Unidad de aleatorizacion: sesion de busqueda.
- Asignacion: 50/50 (Control A = ranking actual, Tratamiento B = score robusto).
- Estratificacion obligatoria: ciudad x categoria de servicio x plataforma (iOS/Android/Web).
- Duracion minima: 14 dias corridos para cubrir estacionalidad semanal.
- Regla de stopping: no early-stop fuera de politica secuencial definida abajo.

## Hipotesis y metricas
Metricas primarias:
- `booking_conversion_rate` (BCR) — mayor es mejor.
- `completion_rate` (CR) — mayor es mejor.
- `refund_claim_rate` (RCR) — menor es mejor.

Metricas secundarias:
- `ctr_top5`
- `time_to_first_contact`
- `repeat_provider_30d`

Guardrails (no degradacion permitida):
- p95 de latencia en feed de resultados
- error rate API de reviews/ranking
- incidence de fraude detectado (proxy risk index)

Hipotesis primarias (dos-cola salvo RCR que es una-cola a la baja):
- H0(BCR): delta_BCR <= 0 ; H1(BCR): delta_BCR > 0
- H0(CR): delta_CR <= 0 ; H1(CR): delta_CR > 0
- H0(RCR): delta_RCR >= 0 ; H1(RCR): delta_RCR < 0

## Potencia estadistica y MDE
- Potencia objetivo: 80%.
- Alpha familia: 0.05.
- Correccion por 3 primarias: Holm-Bonferroni.
- MDE iniciales:
  - BCR: +1.5% relativo
  - CR: +1.0% relativo
  - RCR: -3.0% relativo

Formula de tamano muestral (aprox. proporciones, grupos balanceados):
- `n_por_grupo ~= 2 * p*(1-p) * (z_(1-alpha') + z_(power))^2 / delta^2`
- donde `alpha'` refleja ajuste por multiplicidad.

## Metodo de estimacion
- Estimador principal: diferencia de medias por sesion sobre metrica binaria (equivale a diff de proporciones).
- Error estandar: robusto (HC3) con clustering por usuario si hay multi-sesion.
- Intervalos de confianza: 95%.
- Ajuste de varianza: CUPED con covariable pre-experimento (`historical_booking_propensity`).
- Analisis estratificado: reporte por ciudad/categoria; decision final usa agregado ponderado.

## Politica secuencial
- Monitoreo intermedio permitido cada 48h.
- Frontera secuencial: Pocock (alpha-spending conservador).
- Regla:
  - Stop por dano: si cualquier primaria cruza frontera negativa o guardrail cae fuera de tolerancia.
  - Stop por exito: solo si primarias relevantes cruzan frontera positiva y guardrails sanos.
  - Si no cruza fronteras: continuar hasta ventana minima.

## Calidad de datos y exclusiones
- Excluir trafico de bots/fraude confirmado antes del lock final.
- Validaciones previas al analisis:
  - Sample Ratio Mismatch (SRM) con chi-cuadrado (`p < 0.001` => experimento invalido).
  - Integridad de logging por evento clave (search_impression, click, booking_start, booking_complete, refund_claim).
  - Duplicados e idempotencia de eventos.
- Congelar dataset versionado antes de correr inferencia final.

## Criterio de aprobacion (Release Gate)
PASS si y solo si:
1. Al menos 2 de 3 metricas primarias mejoran con significancia post-correccion.
2. `RCR` no empeora de forma significativa.
3. Ningun guardrail rompe umbral:
   - Latencia p95 <= +5% vs control
   - Error rate <= +0.2 pp vs control
   - Fraud risk index <= +0.1 sigma vs baseline

BLOCKED si cualquiera de los puntos anteriores falla.

## Escalacion a Board
Escalar para decision de Board en las siguientes condiciones:
- Tendencia de `RCR` o churn proxy en deterioro sostenido por 3 cortes consecutivos.
- Riesgo de revenue: delta_BCR negativo y material (>|1.5%| relativo) tras ventana minima.
- Senales de integridad comprometida (SRM persistente o logging incompleto).

## Entregables del analisis
- Notebook/SQL reproducible con seeds y corte temporal.
- Tabla de resultados por metrica (effect size, CI, p-value ajustado).
- Decision memo: PASS/BLOCKED con riesgos remanentes.
- Recomendacion de rollout: 0%, 10%, 50%, 100%.

## Checklist de cierre
- [x] Revisado por CTO (metodologia y supuestos de datos)
- [ ] Revisado por PM/UX (impacto de negocio y experiencia)
- [x] Revisado por Security (filtro de fraude/exclusiones)
- [x] Evidencia adjunta en `qa/test-results/`
- [ ] Decision final registrada en issue RAT-20
