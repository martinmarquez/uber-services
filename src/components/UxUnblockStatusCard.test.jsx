import React from "react";
import { render, screen } from "@testing-library/react";
import UxUnblockStatusCard from "./UxUnblockStatusCard";

describe("UxUnblockStatusCard", () => {
  it("renders a single unblock checklist with explicit pending accessibility gate", () => {
    render(<UxUnblockStatusCard />);

    expect(screen.getByRole("heading", { name: "UX singleton unblock normalization" })).toBeInTheDocument();
    expect(screen.getByText("Evidencia integrada axe/Lighthouse")).toBeInTheDocument();
    expect(screen.getByText("Pendiente")).toBeInTheDocument();
    expect(screen.getByLabelText("Checklist de desbloqueo UX")).toBeInTheDocument();
  });
});
