import { afterEach, describe, expect, it, vi } from "vitest";
import {
  appealReview,
  createReview,
  editReview,
  fetchReviews,
  reportReview,
  respondToReview,
} from "./reviewsApi";

describe("reviewsApi contract paths", () => {
  afterEach(() => {
    vi.restoreAllMocks();
  });

  it("uses canonical v1 provider reviews path", async () => {
    const fetchMock = vi.spyOn(globalThis, "fetch").mockResolvedValue({
      ok: true,
      status: 200,
      json: async () => ({ items: [] }),
    });

    await fetchReviews({ providerId: "prov-1" });
    expect(fetchMock).toHaveBeenCalledWith(
      "/api/v1/providers/prov-1/reviews?limit=20",
      expect.objectContaining({ method: "GET" }),
    );
  });

  it("uses provided canonical limit for provider reviews list", async () => {
    const fetchMock = vi.spyOn(globalThis, "fetch").mockResolvedValue({
      ok: true,
      status: 200,
      json: async () => ({ items: [] }),
    });

    await fetchReviews({ providerId: "prov-1", limit: 12 });
    expect(fetchMock).toHaveBeenCalledWith(
      "/api/v1/providers/prov-1/reviews?limit=12",
      expect.objectContaining({ method: "GET" }),
    );
  });

  it("posts create review to canonical service-request path", async () => {
    const fetchMock = vi.spyOn(globalThis, "fetch").mockResolvedValue({
      ok: true,
      status: 201,
      json: async () => ({ ok: true }),
    });

    await createReview({
      serviceId: "srv-1",
      providerId: "prov-1",
      rating: 5,
      comment: "excelente",
      idempotencyKey: "idem-1",
    });

    expect(fetchMock).toHaveBeenCalledWith(
      "/api/v1/service-requests/srv-1/reviews",
      expect.objectContaining({
        method: "POST",
        body: JSON.stringify({
          providerUserId: "prov-1",
          rating: 5,
          comment: "excelente",
          idempotencyKey: "idem-1",
        }),
      }),
    );
  });

  it("throws when create review has no service request id", async () => {
    await expect(createReview({ providerId: "prov-1", rating: 4 })).rejects.toThrow("service_request_id_required");
  });

  it("uses canonical v1 review action paths", async () => {
    const fetchMock = vi.spyOn(globalThis, "fetch").mockResolvedValue({
      ok: true,
      status: 202,
      json: async () => ({ ok: true }),
    });

    await reportReview("rev_1abcde", { reasonCode: "fraud_signal", idempotencyKey: "idem-r" });
    await respondToReview("rev_1abcde", { message: "gracias", idempotencyKey: "idem-s" });
    await appealReview("rev_1abcde", { note: "Tengo evidencia adicional", idempotencyKey: "idem-a" });

    expect(fetchMock).toHaveBeenNthCalledWith(
      1,
      "/api/v1/reviews/rev_1abcde/reports",
      expect.objectContaining({ method: "POST" }),
    );
    expect(fetchMock).toHaveBeenNthCalledWith(
      2,
      "/api/v1/reviews/rev_1abcde/response",
      expect.objectContaining({ method: "POST" }),
    );
    expect(fetchMock).toHaveBeenNthCalledWith(
      3,
      "/api/v1/reviews/rev_1abcde/appeals",
      expect.objectContaining({ method: "POST" }),
    );
  });

  it("uses canonical v1 review edit path", async () => {
    const fetchMock = vi.spyOn(globalThis, "fetch").mockResolvedValue({
      ok: true,
      status: 200,
      json: async () => ({ ok: true }),
    });

    await editReview("rev_1abcde", { rating: 4, comment: "Actualizo comentario" });
    expect(fetchMock).toHaveBeenCalledWith(
      "/api/v1/reviews/rev_1abcde",
      expect.objectContaining({
        method: "PATCH",
        body: JSON.stringify({ rating: 4, comment: "Actualizo comentario" }),
      }),
    );
  });

  it("throws contract-shaped error metadata when backend returns envelope", async () => {
    vi.spyOn(globalThis, "fetch").mockResolvedValue({
      ok: false,
      status: 403,
      json: async () => ({
        error: {
          code: "AUTHORIZATION_ERROR",
          details: { code: "forbidden_actor" },
        },
      }),
    });

    await expect(createReview({
      serviceId: "srv-1",
      providerId: "prov-1",
      rating: 5,
      idempotencyKey: "idem-1",
    })).rejects.toMatchObject({
      status: 403,
      errorCode: "AUTHORIZATION_ERROR",
      detailsCode: "forbidden_actor",
    });
  });
});
