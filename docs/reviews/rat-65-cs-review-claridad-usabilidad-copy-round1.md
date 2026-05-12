# RAT-65 Round 1 (CS): claridad y usabilidad de copy

Fecha: 2026-05-07  
Owner: Customer Success  
Issue: RAT-65  
Superficie revisada: `src/components/MobileReviewFlow.jsx`

## Objetivo
Reducir confusion de usuarios no tecnicos y senior en el flujo de resenas, cuidando conversion de envio y minimizando tickets por dudas de estado/accion.

## Hallazgos priorizados

1. Alta: confirmacion post-envio no anticipa validacion de estado.
- Copy actual: `Gracias. Tu reseña ya fue registrada.`
- Riesgo: usuarios asumen impacto inmediato y abren ticket cuando ven `En revision`/`No recomendada` despues.
- Reemplazo CS recomendado:
  - `Gracias. Tu reseña fue enviada.`
  - `Puede pasar por validacion antes de impactar el perfil.`

2. Alta: feedback de reporte no explicita proximo paso.
- Copy actual (`aria-live`): `Reporte enviado a moderación`.
- Riesgo: recontacto por incertidumbre de plazos.
- Reemplazo CS recomendado:
  - `Reporte enviado. Lo revisamos y te avisamos por este canal.`

3. Media: instruccion de teclado visible para todos agrega ruido cognitivo en mobile.
- Copy actual: `Usá flechas para ajustar la calificación y tecla 0 para limpiar selección.`
- Riesgo: usuarios mobile no entienden referencia a teclado y dudan del siguiente paso.
- Reemplazo CS recomendado:
  - `Tocá una estrella para calificar. Si queres cambiar, tocá otra.`
  - Nota: mantener instruccion de teclado en `sr-only` para accesibilidad sin sobrecargar UI.

4. Media: prompt de score bajo suena acusatorio para parte de la muestra.
- Copy actual (rating <=2): `Contanos qué salió mal`.
- Riesgo: menor completitud en usuarios sensibles al conflicto.
- Reemplazo CS recomendado:
  - `Si queres, contanos que paso para ayudarte mejor.`

5. Baja: modal de respuesta no explica visibilidad publica.
- Copy actual: `Tu respuesta`.
- Riesgo: arrepentimiento post-envio en usuarios que no esperan publicacion visible.
- Reemplazo CS recomendado:
  - Label: `Tu respuesta (visible en la reseña)`

## Matriz de copy canonico propuesto (Round 1)

- Headline flujo: `¿Como fue tu experiencia?` (se mantiene)
- Helper inicial: `Elegi estrellas para continuar.`
- Helper score bajo: `Si queres, contanos que paso para ayudarte mejor.`
- Placeholder comentario: `Agrega un detalle para ayudar a otros clientes (opcional).`
- Exito envio: `Gracias. Tu reseña fue enviada. Puede pasar por validacion antes de impactar el perfil.`
- Exito reporte: `Reporte enviado. Lo revisamos y te avisamos por este canal.`
- Exito respuesta: `Respuesta enviada. Ya se ve en la reseña.`

## Riesgo de churn y escalacion CEO
- Trigger `exec-watch`: cuenta estrategica + confusion reiterada sobre estado de resena/moderacion + amenaza explicita de abandono.
- Accion CS: escalado al CEO en menos de 4 horas desde deteccion, con macro de contencion y timestamp.

## Siguiente accion operativa
1. Frontend: aplicar 5 cambios de copy en `MobileReviewFlow.jsx` sin alterar logica.
2. QA: smoke mobile con foco en comprension de exito post-envio y flujo reportar/responder.
3. CS: monitoreo 7 dias de:
- `% tickets review-status-confusion`
- `% recontacto <24h post-reporte`
- `% casos exec-watch por confusion de estado`

## Estado de implementacion (2026-05-11)
- Resultado: aplicado.
- Evidencia de cambios:
  - `src/components/MobileReviewFlow.jsx`: copy actualizado en helpers, estados de confianza y mensajes de exito/error.
  - `docs/reviews/rat-6-usability-rounds.md`: agregado `Copy Clarity Pass (UX/UI + CS)`.
  - `docs/reviews/rat-6-cross-review-iteration.md`: refinamientos de accesibilidad y handoff FE con copy freeze.
  - `design-system.md`: agregados `Content Standards` con reglas de lenguaje claro.
- Verificacion minima:
  - `npm test` (suite `src/components/MobileReviewFlow.test.jsx`) en verde.

## Nota operativa de estado (RAT-556)
- Comentario de control-plane recibido el 2026-05-11: issue movida temporalmente de `in_progress` a `todo` por ausencia de run handle activo (`activeRunId=null`, `executionRunId=null`).
- Interpretacion para este issue: correccion administrativa; no implica rollback ni cambios pendientes de UX copy.
- Proximo paso recomendado: restablecer estado terminal (`done`) tras confirmar que no quedan comentarios funcionales abiertos.
