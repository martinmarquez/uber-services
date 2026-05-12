# RAT-13 Review Gate: Priorización de hipótesis (PM)

Fecha: 2026-05-06
Scope: loops de confianza y solicitud de reseñas sin fricción.
Método: ICE (Impacto, Confianza, Facilidad) en escala 1-10. Score = I * C * E.

## Ranking ICE

| Rank | Hipótesis | I | C | E | ICE |
|---|---|---:|---:|---:|---:|
| 1 | Solicitar reseña inmediatamente al marcar servicio completado (in-app modal simple 1-5 + texto opcional) incrementa tasa de reseña sin dañar completion | 9 | 8 | 8 | 576 |
| 2 | Recordatorio único a las 24h para usuarios que no reseñaron aumenta cobertura total de reseñas verificadas | 7 | 8 | 8 | 448 |
| 3 | Mostrar sello “Reseña verificada” junto al CTA de reseñar aumenta confianza y reduce abandono del formulario | 8 | 7 | 7 | 392 |
| 4 | UX de reseña en 2 pasos (rating primero, comentario opcional) mejora completion de formulario vs formulario largo | 7 | 8 | 7 | 392 |
| 5 | Nudge al prestador para responder reseñas <4 estrellas en menos de 48h mejora repeat a 30 días | 8 | 6 | 6 | 288 |
| 6 | Incentivo neutral no monetario (badge/reconocimiento) para dejar reseña aumenta tasa sin sesgar distribución de ratings | 6 | 5 | 5 | 150 |

## Secuencia recomendada de tests

1. H1 + H4 en mismo experimento factorial liviano (timing + simplificación de flujo) para capturar mayor uplift temprano.
2. H2 como segunda ola para expandir cobertura sobre no respondedores sin sobrecargar notificaciones.
3. H3 como ajuste de confianza/comunicación después de validar baseline de conversión.
4. H5 como loop de calidad de oferta (post-MVP de captura de reseñas).
5. H6 sólo después de validar guardrails anti-sesgo y política de neutralidad.

## Riesgos UX / spam y mitigaciones

- Riesgo: fatiga por prompts.
  Mitigación: máximo 1 prompt in-app + 1 recordatorio en 24h, luego silencio por orden.
- Riesgo: incentivos sesgados hacia rating alto.
  Mitigación: regla de neutralidad estricta (mismo beneficio para cualquier rating).
- Riesgo: reseñas de baja calidad por fricción baja extrema.
  Mitigación: rating obligatorio, texto opcional con validaciones mínimas anti-spam.
- Riesgo: manipulación coordinada por bursts.
  Mitigación: usar estados de confianza y deboost de señales anómalas definidos en Trust/Safety.
- Riesgo: daño en experiencia por interrupción en momento crítico.
  Mitigación: disparar solicitud sólo tras confirmación de servicio completado y permitir dismiss claro.

## Gate decision (PM)

Aprobado con foco de ejecución en H1/H4/H2 para Iteración 1-2.

Condiciones de aprobación:
- No lanzar incentivos (H6) hasta aprobar revisión de policy/compliance y monitoreo de sesgo.
- Mantener guardrail de frecuencia de prompts para evitar degradación de NPS.
- Definir métricas de stop temprano por daño (opt-out de notificaciones, quejas por spam, caída en completion).
