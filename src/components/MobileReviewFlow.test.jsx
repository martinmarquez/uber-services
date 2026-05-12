import React from "react";
import { fireEvent, render, screen, waitFor } from "@testing-library/react";
import userEvent from "@testing-library/user-event";
import MobileReviewFlow from "./MobileReviewFlow";

const mockFetchReviews = vi.fn();
const mockDiscoverProviders = vi.fn();
const mockCreateReview = vi.fn();
const mockAppealReview = vi.fn();

vi.mock("../analytics/reviewExperimentTracking", () => ({
  getOrCreateReviewExperimentAssignment: () => ({
    variant: "control",
    subjectId: "cus-1",
    sessionId: "sess-1",
  }),
  trackCommentStarted: vi.fn(),
  trackReviewConversion: vi.fn(),
  trackReportSubmitted: vi.fn(),
  trackRespondSubmitted: vi.fn(),
  trackStarSelected: vi.fn(),
  trackTagToggled: vi.fn(),
}));

vi.mock("../api/reviewsApi", () => ({
  fetchReviews: (...args) => mockFetchReviews(...args),
  createReview: (...args) => mockCreateReview(...args),
  appealReview: (...args) => mockAppealReview(...args),
  reportReview: vi.fn().mockResolvedValue({ status: "en_revision", riskScore: 82 }),
  respondToReview: vi.fn().mockResolvedValue({ providerResponse: "Gracias por tu comentario." }),
}));

vi.mock("../api/discoveryBookingApi", () => ({
  discoverProviders: (...args) => mockDiscoverProviders(...args),
  createServiceRequest: vi.fn().mockResolvedValue({ serviceRequest: { id: "srv-9001" } }),
}));

describe("MobileReviewFlow", () => {
  beforeEach(() => {
    mockCreateReview.mockResolvedValue({ review: { status: "verificada" } });
    mockAppealReview.mockResolvedValue({ ok: true, appeal: { id: "apl-1", status: "open" } });
    mockDiscoverProviders.mockResolvedValue({
      providers: [
        {
          userId: "prov-1",
          displayName: "Plomeria Centro",
          category: "plumbing",
          city: "Buenos Aires",
          distanceKm: 1.2,
          rating: 4.8,
          completedJobs: 112,
          isActive: true,
        },
      ],
    });
    mockFetchReviews.mockResolvedValue({ items: [] });
  });

  it("falls back to backup reviews when API fails and shows warning + retry action", async () => {
    mockFetchReviews.mockRejectedValueOnce(new Error("network_error"));
    render(<MobileReviewFlow />);

    expect(await screen.findByText("Mostramos reseñas recientes en modo respaldo. Reintentar carga en vivo.")).toBeInTheDocument();
    expect(screen.getByText("Plomería Norte")).toBeInTheDocument();
    expect(screen.getByRole("button", { name: "Reintentar" })).toBeInTheDocument();
  });

  it("keeps discovery usable with fallback providers when live discovery fails", async () => {
    mockDiscoverProviders.mockRejectedValueOnce(new Error("network_error"));
    render(<MobileReviewFlow />);

    expect(await screen.findByText("No pudimos cargar descubrimiento en vivo. Reintentá en unos segundos.")).toBeInTheDocument();
    expect(screen.getByRole("button", { name: /Plomeria Norte/i })).toBeInTheDocument();
    expect(screen.getByRole("button", { name: /Limpieza Express/i })).toBeInTheDocument();
  });

  it("keeps selected filter after retrying reviews load", async () => {
    mockFetchReviews
      .mockRejectedValueOnce(new Error("temporary_error"))
      .mockRejectedValueOnce(new Error("temporary_error"))
      .mockResolvedValueOnce({ items: [{ id: "rev_1abcde", provider: "Gas Norte", service: "Revision", createdAt: "Hoy", rating: 5, verified: true, riskScore: 10, status: "verificada", tags: ["Excelente"], comment: "Perfecto", providerResponse: "Gracias" }] });

    render(<MobileReviewFlow />);
    const criticalFilter = await screen.findByRole("button", { name: "1-2★" });
    await userEvent.click(criticalFilter);

    const retry = await screen.findByRole("button", { name: "Reintentar" });
    await userEvent.click(retry);

    await waitFor(() => expect(mockFetchReviews).toHaveBeenLastCalledWith({ providerId: "prov-1" }));
  });

  it("supports keyboard control for star rating", async () => {
    render(<MobileReviewFlow />);
    expect(
      screen.getByText(
        "Usá las flechas para ajustar la calificación. La tecla Inicio va a 1 estrella, Fin a 5 y 0 limpia la selección.",
      ),
    ).toBeInTheDocument();
    const oneStar = await screen.findByRole("radio", { name: "1 estrella" });
    oneStar.focus();
    fireEvent.keyDown(oneStar, { key: "ArrowRight" });

    const twoStar = screen.getByRole("radio", { name: "2 estrellas" });
    expect(twoStar).toHaveAttribute("aria-checked", "true");

    fireEvent.keyDown(twoStar, { key: "End" });
    const fiveStar = screen.getByRole("radio", { name: "5 estrellas" });
    expect(fiveStar).toHaveAttribute("aria-checked", "true");

    fireEvent.keyDown(fiveStar, { key: "Home" });
    expect(oneStar).toHaveAttribute("aria-checked", "true");
  });

  it("shows failed submission feedback when create review API fails", async () => {
    mockCreateReview.mockRejectedValueOnce(new Error("forbidden_actor"));
    render(<MobileReviewFlow />);

    const oneStar = await screen.findByRole("radio", { name: "1 estrella" });
    await userEvent.click(oneStar);
    const submit = screen.getByRole("button", { name: "Enviar reseña" });
    await userEvent.click(submit);

    await waitFor(() => {
      expect(screen.getByText("No pudimos enviar la reseña. Reintentá en unos segundos.")).toBeInTheDocument();
    });
  });

  it("closes report modal with Escape and restores focus to invoking control", async () => {
    mockFetchReviews.mockResolvedValueOnce({
      items: [
        {
          id: "rev_1abcde",
          provider: "Gas Norte",
          service: "Revision",
          createdAt: "2026-05-11T08:00:00.000Z",
          rating: 4,
          verified: true,
          riskScore: 10,
          status: "verificada",
          tags: ["Excelente"],
          comment: "Perfecto",
          providerResponse: "Gracias",
        },
      ],
    });
    render(<MobileReviewFlow />);

    const reportButton = await screen.findByRole("button", { name: "Reportar reseña de Gas Norte" });
    await userEvent.click(reportButton);
    expect(screen.getByRole("dialog", { name: "Reportar reseña" })).toBeInTheDocument();

    fireEvent.keyDown(window, { key: "Escape" });
    await waitFor(() => expect(screen.queryByRole("dialog", { name: "Reportar reseña" })).not.toBeInTheDocument());
    expect(reportButton).toHaveFocus();
  });

  it("traps keyboard focus inside report modal", async () => {
    mockFetchReviews.mockResolvedValueOnce({
      items: [
        {
          id: "rev_2abcde",
          provider: "Gas Norte",
          service: "Revision",
          createdAt: "2026-05-11T08:00:00.000Z",
          rating: 4,
          verified: true,
          riskScore: 10,
          status: "verificada",
          tags: ["Excelente"],
          comment: "Perfecto",
          providerResponse: "Gracias",
        },
      ],
    });
    render(<MobileReviewFlow />);

    await userEvent.click(await screen.findByRole("button", { name: "Reportar reseña de Gas Norte" }));
    const sendReportButton = screen.getByRole("button", { name: "Enviar reporte" });
    sendReportButton.focus();

    fireEvent.keyDown(window, { key: "Tab" });
    expect(screen.getByRole("combobox", { name: "Motivo" })).toHaveFocus();
  });

  it("traps keyboard focus inside respond modal and restores focus on close", async () => {
    mockFetchReviews.mockResolvedValueOnce({
      items: [
        {
          id: "rev_3abcde",
          provider: "Gas Norte",
          service: "Revision",
          createdAt: "2026-05-11T08:00:00.000Z",
          rating: 4,
          verified: true,
          riskScore: 10,
          status: "verificada",
          tags: ["Excelente"],
          comment: "Perfecto",
          providerResponse: "Gracias",
        },
      ],
    });
    render(<MobileReviewFlow />);

    const respondButton = await screen.findByRole("button", { name: "Responder actualización de Gas Norte" });
    await userEvent.click(respondButton);

    const responseInput = screen.getByRole("textbox", { name: "Tu respuesta (visible en la reseña)" });
    await userEvent.type(responseInput, "Gracias por responder");
    const sendResponseButton = screen.getByRole("button", { name: "Enviar respuesta" });
    sendResponseButton.focus();
    fireEvent.keyDown(window, { key: "Tab" });
    expect(responseInput).toHaveFocus();

    fireEvent.keyDown(window, { key: "Escape" });
    await waitFor(() => expect(screen.queryByRole("dialog", { name: "Responder al prestador" })).not.toBeInTheDocument());
    expect(respondButton).toHaveFocus();
  });

  it("keeps report/respond dialogs mutually exclusive through a singleton modal controller", async () => {
    mockFetchReviews.mockResolvedValueOnce({
      items: [
        {
          id: "rev_4abcde",
          provider: "Gas Norte",
          service: "Revision",
          createdAt: "2026-05-11T08:00:00.000Z",
          rating: 4,
          verified: true,
          riskScore: 10,
          status: "verificada",
          tags: ["Excelente"],
          comment: "Perfecto",
          providerResponse: "Gracias",
        },
      ],
    });
    render(<MobileReviewFlow />);

    await userEvent.click(await screen.findByRole("button", { name: "Reportar reseña de Gas Norte" }));
    expect(screen.getByRole("dialog", { name: "Reportar reseña" })).toBeInTheDocument();
    expect(screen.queryByRole("dialog", { name: "Responder al prestador" })).not.toBeInTheDocument();
  });

  it("maps runtime taxonomy alias under_review to En revision badge", async () => {
    mockFetchReviews.mockResolvedValueOnce({
      items: [
        {
          id: "rev_5abcde",
          provider: "Gas Norte",
          service: "Revision",
          createdAt: "2026-05-11T08:00:00.000Z",
          rating: 4,
          verified: true,
          riskScore: 10,
          status: "under_review",
          tags: ["Excelente"],
          comment: "Perfecto",
          providerResponse: "Gracias",
        },
      ],
    });
    render(<MobileReviewFlow />);

    expect(await screen.findByText("En revision")).toBeInTheDocument();
  });

  it("shows Iniciar apelacion CTA only for no_recomendada and submits appeal", async () => {
    mockFetchReviews.mockResolvedValueOnce({
      items: [
        {
          id: "rev_6abcde",
          provider: "Gas Norte",
          service: "Revision",
          createdAt: "2026-05-11T08:00:00.000Z",
          rating: 2,
          verified: true,
          riskScore: 82,
          status: "no_recomendada",
          tags: ["Calidad baja"],
          comment: "No cumplió",
          providerResponse: "Queremos revisar",
        },
      ],
    });
    render(<MobileReviewFlow />);

    const appealButton = await screen.findByRole("button", { name: "Iniciar apelacion de reseña de Gas Norte" });
    await userEvent.click(appealButton);

    await waitFor(() => expect(mockAppealReview).toHaveBeenCalledWith(
      "rev_6abcde",
      expect.objectContaining({ note: expect.any(String), idempotencyKey: expect.stringContaining("appeal-") }),
    ));
  });

  it("does not show appeal CTA for en_revision", async () => {
    mockFetchReviews.mockResolvedValueOnce({
      items: [
        {
          id: "rev_7abcde",
          provider: "Gas Norte",
          service: "Revision",
          createdAt: "2026-05-11T08:00:00.000Z",
          rating: 2,
          verified: true,
          riskScore: 86,
          status: "en_revision",
          tags: ["Calidad baja"],
          comment: "No cumplió",
          providerResponse: "Queremos revisar",
        },
      ],
    });
    render(<MobileReviewFlow />);

    expect(await screen.findByText("En revision")).toBeInTheDocument();
    expect(screen.queryByRole("button", { name: "Iniciar apelacion de reseña de Gas Norte" })).not.toBeInTheDocument();
  });
});
