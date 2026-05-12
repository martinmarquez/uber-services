# RAT-436 Heartbeat: bloquear reaperturas automaticas sin resume explicito (2026-05-11)

## Contexto del wake
- Issue: `RAT-436`
- Motivo: `issue_assigned`
- Estado al entrar: `in_progress`
- Comentarios pendientes: `0/0`

No hubo nuevo comentario humano en este wake; se ejecutó acción directa sobre el scope técnico solicitado.

## Accion ejecutada en este heartbeat
1. Se validó Goal Gate: `PRODUCT_BRIEF.md` y `ADR.md` existen en `$AGENT_HOME`.
2. Se inspeccionó el workspace asignado (`/Users/martinmarquez/uber-services`) para ubicar runtime dueño de reaperturas automáticas de issues terminales.
3. Se confirmó que este repositorio contiene lógica de dominio de producto (reviews/appeals), no el runtime de lifecycle del control-plane de Paperclip (`/api/issues` transitions + checkout reopen guard + wake dedupe).

## Hallazgo
`RAT-436` es un fix de plataforma/control-plane fuera del ownership técnico de este repo. En este workspace no existe la superficie ejecutable donde parchear:
- transición terminal `done/cancelled` -> activa,
- checkout que reabre implícitamente,
- deduplicación de wakes `issue_status_changed` sin delta.

## Decision operativa
Se bloquea implementación local por boundary de ownership. No se aplica workaround en repo no dueño.

## Unblock owner/action
- Owner: maintainer del runtime de lifecycle del control-plane de Paperclip.
- Action requerida:
  1. Enforce: issues terminales (`done`/`cancelled`) no reabren sin `resume:true` explícito.
  2. Checkout no muta estado terminal sin `resume:true`.
  3. No-delta `issue_status_changed` no dispara reopen/requeue.
  4. Adjuntar regresiones y replay API en issue equivalente terminal.

## Siguiente accion clara
Transferir ejecución del patch al repositorio/superficie dueña del lifecycle runtime y mantener `RAT-436` como bloqueado hasta evidencia de replay.
