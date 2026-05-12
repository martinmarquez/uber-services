# RAT-62 Round 1 (CS): claridad operativa para playbooks de soporte

Fecha: 2026-05-07  
Owner: Customer Success  
Documento revisado: `docs/review-trust-policy-draft-es.md`

## Objetivo
Reducir ambiguedad operativa para que CS pueda explicar estados, manejar apelaciones y desactivar riesgo de churn sin escalar innecesariamente.

## Hallazgos de claridad (Round 1)
1. Definicion de estado sin impacto operativo explicito.
- Brecha: el borrador define `En revision` y `No recomendada`, pero no fija si impacta score/distribucion durante la revision.
- Riesgo CS: respuestas inconsistentes entre agentes y mayor ticket reabierto.
- Frase CS-ready sugerida:
  - `En revision: la reseña sigue visible con impacto limitado hasta cerrar validacion.`
  - `No recomendada: la reseña puede seguir visible, pero no contribuye al score de reputacion.`

2. SLA de apelacion no aterrizado a promesa de primer contacto.
- Brecha: hay SLA de acuse/resolucion, pero sin guion obligatorio de primer contacto.
- Riesgo CS: variacion en tono y promesas fuera de SLA.
- Frase CS-ready sugerida:
  - `Recibimos tu apelacion. Te confirmamos recepcion en menos de 24 horas y te compartimos resolucion en hasta 7 dias corridos (15 dias si el caso es complejo).`

3. "Puede ser limitada o removida" sin criterio comunicable de decision.
- Brecha: para usuario final no queda claro cuando se limita vs remueve.
- Riesgo CS: percepcion de arbitrariedad en cuentas sensibles.
- Frase CS-ready sugerida:
  - `Cuando detectamos riesgo medio, limitamos distribucion mientras investigamos. Solo removemos ante evidencia grave o reincidencia critica.`

4. Requisito de evidencia en apelacion sin checklist de "minimo suficiente".
- Brecha: pide evidencia concreta, pero no define set minimo para evitar ida y vuelta.
- Riesgo CS: demoras evitables y friccion post-contacto.
- Frase CS-ready sugerida:
  - `Para acelerar tu apelacion, inclui: ID de reseña, comprobante del servicio y una breve descripcion de por que crees que hubo un error.`

5. Escalacion anti-represalia sin trigger operativo de soporte.
- Brecha: policy indica priorizacion, pero no define trigger de triage en soporte.
- Riesgo CS: casos sensibles no priorizados a tiempo.
- Frase CS-ready sugerida:
  - `Si reportas amenaza o represalia por una reseña, abrimos revision prioritaria inmediata y protegemos tu cuenta durante el analisis.`

## Playbook CS recomendado (implementacion inmediata)
1. Macro obligatoria por estado visible (`verificada`, `en revision`, `no recomendada`, `removida`).
2. Macro unica de apelacion con SLA cerrado (24h acuse / 7d estandar / 15d complejos).
3. Trigger de riesgo `exec-watch` para:
- amenaza explicita de abandono,
- acusacion de arbitrariedad en cuenta estrategica,
- reportes de represalia.
4. Checklist de evidencia minima en primer contacto para reducir ciclos.

## Riesgo de churn y escalacion CEO
- Riesgo alto: cuenta estrategica + estado `no recomendada` o `removida` + desacuerdo explicito.
- Accion: escalar a CEO en <4h con plan de contencion y timestamp.

## Siguiente accion propuesta
Actualizar policy publica y macros de soporte con el set CS-ready de este review, luego medir durante 7 dias:
- `% tickets review-status-confusion`
- `% apelaciones con evidencia completa en primer envio`
- `% casos exec-watch escalados a CEO en <4h`
