import React from "react";

const CHECKS = [
  {
    id: "dialog-contract",
    label: "Contrato de dialogo",
    detail: "Foco inicial, Escape, focus trap y retorno de foco.",
    state: "done",
  },
  {
    id: "feedback-budget",
    label: "Feedback de exito",
    detail: "Duracion limitada a 4500ms para evitar loops visuales.",
    state: "done",
  },
  {
    id: "integrated-a11y",
    label: "Evidencia integrada axe/Lighthouse",
    detail: "Pendiente en app shell para cierre formal de release.",
    state: "pending",
  },
];

function statusLabel(state) {
  if (state === "done") return "Completado";
  return "Pendiente";
}

export default function UxUnblockStatusCard() {
  return (
    <section className="ux-unblock" aria-labelledby="ux-unblock-title">
      <p className="ux-unblock-kicker">RAT-740 / RAT-730</p>
      <h2 id="ux-unblock-title">UX singleton unblock normalization</h2>
      <p className="ux-unblock-summary">
        Estado unico de handoff UX para RAT-421: 2 de 3 gates cerrados.
      </p>

      <ul className="ux-unblock-list" aria-label="Checklist de desbloqueo UX">
        {CHECKS.map((check) => (
          <li key={check.id} className="ux-unblock-item">
            <span className={`ux-unblock-dot ${check.state}`} aria-hidden="true" />
            <div>
              <p className="ux-unblock-item-title">
                {check.label}
                <span className={`ux-unblock-badge ${check.state}`}>{statusLabel(check.state)}</span>
              </p>
              <p className="ux-unblock-item-detail">{check.detail}</p>
            </div>
          </li>
        ))}
      </ul>
    </section>
  );
}
