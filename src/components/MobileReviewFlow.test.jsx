import React from "react";
import { fireEvent, render, screen, waitFor } from "@testing-library/react";
import userEvent from "@testing-library/user-event";
import MobileReviewFlow from "./MobileReviewFlow";

const mockFetchReviews = vi.fn();
const mockDiscoverProviders = vi.fn();

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
  createReview: vi.fn().mockResolvedValue({ review: { status: "verified" } }),
  reportReview: vi.fn().mockResolvedValue({ status: "under_review", riskScore: 82 }),
  respondToReview: vi.fn().mockResolvedValue({ providerResponse: "Gracias por tu comentario." }),
}));

vi.mock("../api/discoveryBookingApi", () => ({
  discoverProviders: (...args) => mockDiscoverProviders(...args),
  createServiceRequest: vi.fn().mockResolvedValue({ serviceRequest: { id: "srv-9001" } }),
}));

describe("MobileReviewFlow", () => {
  beforeEach(() => {
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

  it("keeps selected filter after retrying reviews load", async () => {
    mockFetchReviews
      .mockRejectedValueOnce(new Error("temporary_error"))
      .mockRejectedValueOnce(new Error("temporary_error"))
      .mockResolvedValueOnce({ items: [{ id: "rev_1abcde", provider: "Gas Norte", service: "Revision", createdAt: "Hoy", rating: 5, verified: true, riskScore: 10, status: "verified", tags: ["Excelente"], comment: "Perfecto", providerResponse: "Gracias" }] });

    render(<MobileReviewFlow />);
    const criticalFilter = await screen.findByRole("button", { name: "1-2★" });
    await userEvent.click(criticalFilter);

    const retry = await screen.findByRole("button", { name: "Reintentar" });
    await userEvent.click(retry);

    await waitFor(() => expect(mockFetchReviews).toHaveBeenLastCalledWith({ serviceId: "srv-8241", filter: "critical" }));
  });

  it("supports keyboard control for star rating", async () => {
    render(<MobileReviewFlow />);
    const oneStar = await screen.findByRole("radio", { name: "1 estrella" });
    oneStar.focus();
    fireEvent.keyDown(oneStar, { key: "ArrowRight" });

    const twoStar = screen.getByRole("radio", { name: "2 estrellas" });
    expect(twoStar).toHaveAttribute("aria-checked", "true");
  });
});
