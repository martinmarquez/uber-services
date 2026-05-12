# CUSTOMER_ENTITIES.md

## Patrones activos (2026-05-06)

### Patron 1: confusion de estados de reseña
- Señal: usuarios no distinguen `en revision` vs `no recomendada`.
- Impacto: recontacto a soporte, erosion de confianza.
- Accion: microcopy mas explicito + macro de soporte unificada.

### Patron 2: sensibilidad alta en cuentas estrategicas
- Señal: incidentes de moderacion se perciben como arbitrariedad.
- Impacto: riesgo directo de churn.
- Accion: ruta `exec-watch` y escalacion CEO en < 4 horas.

### Patron 3: abandono post-seleccion de estrellas
- Señal: usuario califica pero no envia.
- Impacto: menor volumen de feedback util.
- Accion: reducir friccion en paso final (tags primero, comentario opcional).

### Patron 4: apelaciones con evidencia incompleta
- Señal: apelacion sin ID de reseña, comprobante o contexto minimo.
- Impacto: ciclos extra de soporte y mayor tiempo de resolucion.
- Accion: macro de "evidencia minima" en primer contacto + checklist obligatorio.

### Patron 5: riesgo reputacional por reportes de represalia
- Señal: usuario reporta amenaza/penalizacion por reseña negativa.
- Impacto: riesgo de churn y escalacion publica.
- Accion: tag `exec-watch`, triage prioritario inmediato y escalacion CEO < 4h.

## Patrones activos (2026-05-07)

### Patron 6: falsa expectativa de impacto inmediato post-envio
- Señal: usuario interpreta `reseña registrada` como impacto inmediato en perfil/score.
- Impacto: tickets por "reseña enviada pero sin impacto", riesgo de desconfianza en cuentas sensibles.
- Accion: copy de confirmacion con validacion explicita + macro CS de estado en primer contacto.

### Patron 7: deuda operativa en playbook de moderacion
- Señal: issue de seguridad/moderacion permanece activo sin evidencia de entregable y bloquea cierre de issue dependiente.
- Impacto: riesgo de respuestas inconsistentes ante abuso, mayor volumen de escalaciones y riesgo de churn por perdida de confianza.
- Accion: exigir en cada heartbeat evidencia de progreso (documento, decision, ETA) o bloqueo explicito con owner de desbloqueo.

### Patron 8: mejora de consistencia tras hardening de moderacion
- Señal: reglas de severidad + templates + doble aprobacion en SEV-0/1 reducen ambiguedad operativa.
- Impacto: menor friccion en soporte y menor riesgo de churn por percepcion de arbitrariedad.
- Accion: mantener QA semanal de consistencia y alertar al CEO ante cualquier breach de SLA SEV-0/1.

## Patrones activos (2026-05-10)

### Patron 9: ansiedad por "cola invisible" en moderacion
- Señal: usuario no entiende si su caso esta esperando triage o ya en revision de fondo.
- Impacto: recontacto repetido, desgaste de confianza y riesgo de churn en cuentas estrategicas.
- Accion: exponer siempre `numero de caso + estado + proximo checkpoint` en cada respuesta de soporte.

### Patron 10: escalacion por SLA de apelacion sin update proactivo
- Señal: ticket supera 48h sin update aunque siga dentro de SLA de resolucion final.
- Impacto: percepcion de abandono y escalacion ejecutiva evitable.
- Accion: cadencia proactiva de seguimiento (cada 24-48h) y tag automatico `exec-watch` en cuentas sensibles.

### Patron 11: apelacion rechazada sin motivo entendible
- Señal: usuario reabre o escala por no comprender fundamento de la decision.
- Impacto: aumento de `appeal_reopen_rate` y carga soporte.
- Accion: macro obligatoria con motivo de alto nivel + referencia a policy aplicable + paso siguiente concreto.
