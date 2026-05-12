# RAT-61 Round 1 PM Alignment: Trust Policy + Microcopy

Fecha: 2026-05-07
Owner: PM
Estado: Ready for cross-functional review
Issue: RAT-61

## Objetivo
Cerrar alineacion PM v1 entre policy publica, contrato API/UI y copy visible para reducir ambiguedad al usuario y evitar scope creep antes de implementacion final.

## Decision de producto (Round 1)
1. Se congela v1 en 4 estados visibles: `verificada`, `en_revision`, `no_recomendada`, `removida`.
2. El copy de usuario no expone umbrales numericos ni reglas antifraude internas.
3. `en_revision`, `no_recomendada` y `removida` quedan fuera del score publico en MVP.
4. Incentivos permitidos solo bajo neutralidad; cualquier condicionamiento de nota escala a enforcement SEV-1 minimo.
5. Apelaciones quedan habilitadas con trazabilidad de estado final visible.

## Gate de alcance (anti-scope creep)
Incluido en RAT-61:
- Alineacion semantica policy <-> API/UI <-> microcopy.
- Set final de microcopy v1 (ES-AR) para badges/estados y apelacion.
- Criterios testables de aceptacion para FE/BE/QA.

No incluido en RAT-61:
- Nuevos estados de moderacion.
- Cambios de thresholds antifraude de RAT-9.
- Localizacion multi-idioma.
- Rework de ranking o experimentos de incentivo avanzados.

## Microcopy canonico v1 (ES-AR)
### 1) `verificada`
- Badge: `Reseña verificada`
- Supporting: `Este usuario contrato el servicio en la app.`

### 2) `en_revision`
- Badge: `En revision`
- Supporting: `Estamos validando esta reseña para proteger la confianza en la plataforma.`

### 3) `no_recomendada`
- Badge: `No recomendada`
- Supporting: `Esta reseña no cumple nuestros criterios de confiabilidad.`

### 4) `removida`
- Feed behavior: no visible publicamente.
- Author-facing notice: `Removimos esta reseña por incumplimiento de la politica de reseñas.`

### 5) Incentivos (prestadores)
- `Podes incentivar reseñas, pero nunca condicionar la calificacion.`

### 6) Apelaciones
- `Si crees que hubo un error, podes apelar desde Soporte con evidencia de la transaccion.`

## User Stories + Acceptance Criteria
### Story A (Cliente)
Como cliente, quiero entender si una reseña es confiable para tomar mejores decisiones.

Criterios de aceptacion:
- Dado un review con `status=verificada`, se muestra badge `Reseña verificada` + supporting canonico.
- Dado `status=en_revision`, se muestra badge/leyenda de revision y la reseña no impacta score agregado.
- Dado `status=no_recomendada`, se muestra badge/leyenda de baja confiabilidad y no impacta score agregado.

### Story B (Prestador)
Como prestador, quiero reglas claras sobre incentivos para no incumplir policy.

Criterios de aceptacion:
- En superficies de guidance de reseñas se muestra mensaje de neutralidad de incentivos.
- Si se detecta incentivo condicionado a nota, el caso queda etiquetado con `incentive_bias` (SEV-1 minimo) y sale del score publico.

### Story C (Autor que apela)
Como usuario, quiero apelar decisiones de moderacion para corregir errores.

Criterios de aceptacion:
- Toda decision no-verificada expone CTA o ruta a apelacion en Soporte.
- Toda apelacion resuelta registra estado final visible (`en_revision`, `no_recomendada`, `removida` o `verificada` por restitucion).

## Contrato funcional PM para implementacion
- Fuente unica de verdad de estados: enum canonico de [RAT-42](/RAT/issues/RAT-42).
- Mapping policy-operacion: reason codes/severidad de [RAT-44](/RAT/issues/RAT-44).
- Politica publica: actualizar borrador de `docs/review-trust-policy-draft-es.md` con copy canonico v1.

## Secuencia de sprint recomendada
1. FE: implementar badges/leyendas con mapping 1:1 por estado canonico.
2. BE: garantizar exclusion de estados no verificables del score publico y trazabilidad de apelacion.
3. QA: validar matriz de estados/copy y exclusion de agregados.
4. PM/Comms: publicar policy v1 y checklist de consistencia para soporte.

## Riesgos y mitigaciones
- Riesgo: divergencia de copy entre superficies.
  - Mitigacion: tabla canonica unica en handoff + QA snapshot tests de strings.
- Riesgo: confundir `en_revision` vs `no_recomendada`.
  - Mitigacion: guideline UX: `en_revision` = temporal, `no_recomendada` = decision de confiabilidad.

## Exit criteria de RAT-61
- Aprobacion de PM sobre copy canonico v1.
- Confirmacion de FE/BE que el enum canonico no cambia.
- QA con casos minimos pasando para 4 estados y exclusion de score.
- Comentario final en issue con links a artefactos y owners de siguiente paso.
