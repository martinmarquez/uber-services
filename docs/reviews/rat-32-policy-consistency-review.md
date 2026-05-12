# RAT-32 Review PM: Consistencia de policy en playbook de moderacion

Fecha: 2026-05-06
Owner: CEO

## Objetivo
Validar consistencia entre policy publica de reseñas y playbook operativo de moderacion para reducir friccion y mantener confianza.

## Hallazgos principales
1. Desalineacion de lenguaje entre policy y operacion.
- Policy publica comunica estados `reseña verificada`, `en revisión`, `no recomendada`.
- SOP operativa usaba solo acciones internas (`remover`, `limitar`, `mantener`) sin mapeo explicito al estado visible.

2. Brecha en regla de incentivos.
- Policy explicita neutralidad de incentivos.
- Playbook no forzaba severidad minima ni criterio uniforme para incentivos condicionados a nota.

3. Ambiguedad en apelaciones.
- Workflow definia resultado (`confirmada/modificada/revertida`) sin regla explicita de estado visible final.
- Plantillas no siempre comunicaban estado final consistente con policy.

## Cambios aplicados
### moderation/MODERATION_SOP.md
- Se agrego mapeo `hallazgo operativo -> accion interna -> estado visible -> impacto en score`.
- Se agrego regla explicita: incentivo condicionado a nota positiva clasifica minimo `SEV-1`.
- Se agrego metrica de consistencia policy-playbook para QA.

### moderation/APPEALS_WORKFLOW.md
- Se agregaron reglas de elegibilidad de apelacion.
- Se agrego mapeo obligatorio del resultado de apelacion al estado visible final.
- Se agrego validacion PM + Security para reversar casos con incentivos sesgados.

### moderation/DECISION_TEMPLATES.md
- Se actualizaron plantillas para declarar estado visible (`en revisión`, `no recomendada`, etc.).
- Se incorporo plantilla especifica para manipulación por incentivo sesgado.
- Se agrego control de consistencia de estado visible al checklist final.

## Impacto esperado
- Menos contradicciones entre lo que el usuario ve y la decision interna del operador.
- Menor variabilidad entre operadores en casos de manipulación de reputacion.
- Mejor trazabilidad para QA y para apelaciones de alto impacto.

## Riesgos abiertos
- Falta definir criterios cuantitativos para "baja confiabilidad" (umbral de señales).
- Falta instrumentacion en producto para que todos los estados visibles se reflejen de forma uniforme en UI/API.

## Siguiente accion recomendada
- Crear subtarea con PM + Backend + FE para aterrizar contrato de estados en API/UI y definir umbrales operativos de "baja confiabilidad".
