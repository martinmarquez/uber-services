import test from "node:test";
import assert from "node:assert/strict";
import { createApiServer } from "../src/http/server.js";

async function withServer(run) {
  const server = createApiServer();
  await new Promise((resolve) => server.listen(0, "127.0.0.1", resolve));
  const { port } = server.address();
  try {
    await run(`http://127.0.0.1:${port}`);
  } finally {
    await new Promise((resolve) => server.close(resolve));
  }
}

test("GET /api/v1/providers/discovery returns provider list", async () => {
  await withServer(async (baseUrl) => {
    const response = await fetch(`${baseUrl}/api/v1/providers/discovery?category=cleaning&city=Buenos%20Aires&limit=10`);
    assert.equal(response.status, 200);
    const payload = await response.json();
    assert.equal(payload.ok, true);
    assert.equal(Array.isArray(payload.providers), true);
    assert.equal(payload.providers.length, 1);
  });
});

test("POST /api/v1/service-requests validates payload", async () => {
  await withServer(async (baseUrl) => {
    const response = await fetch(`${baseUrl}/api/v1/service-requests`, {
      method: "POST",
      headers: {
        "content-type": "application/json",
        "x-actor-id": "cus-1",
        "x-actor-roles": "customer",
      },
      body: JSON.stringify({
        idempotencyKey: "book-test-1",
        providerUserId: "prov-1",
        category: "cleaning",
        city: "Buenos Aires",
        notes: "short",
        scheduledAt: "2026-05-11T10:00:00.000Z",
      }),
    });

    assert.equal(response.status, 400);
    const payload = await response.json();
    assert.equal(payload.error.code, "VALIDATION_ERROR");
    assert.equal(payload.error.details.code, "invalid_notes");
  });
});

test("legacy FE alias POST /api/reviews maps to canonical review creation route", async () => {
  await withServer(async (baseUrl) => {
    const response = await fetch(`${baseUrl}/api/reviews`, {
      method: "POST",
      headers: {
        "content-type": "application/json",
        "x-actor-id": "usr_123456",
        "x-actor-roles": "customer",
      },
      body: JSON.stringify({
        idempotencyKey: "idem-review-1",
        providerUserId: "prov-1",
        rating: 5,
        comment: "Excelente servicio y puntualidad.",
        serviceCompletedAt: "2026-05-07T10:00:00.000Z",
        now: "2026-05-07T11:00:00.000Z",
      }),
    });

    assert.equal(response.status, 201);
    const payload = await response.json();
    assert.equal(payload.ok, true);
    assert.equal(payload.review.rating, 5);
  });
});
