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

test("GET /api/v1/service-requests/:serviceRequestId returns status for owner and rejects unrelated actor", async () => {
  await withServer(async (baseUrl) => {
    const create = await fetch(`${baseUrl}/api/v1/service-requests`, {
      method: "POST",
      headers: {
        "content-type": "application/json",
        "x-actor-id": "cus-status-1",
        "x-actor-roles": "customer",
      },
      body: JSON.stringify({
        idempotencyKey: "book-status-1",
        providerUserId: "prov-1",
        category: "cleaning",
        city: "Buenos Aires",
        notes: "Need full home cleaning this weekend",
        scheduledAt: "2026-05-11T10:00:00.000Z",
      }),
    });
    assert.equal(create.status, 201);
    const createdPayload = await create.json();

    const ownerRead = await fetch(
      `${baseUrl}/api/v1/service-requests/${createdPayload.serviceRequest.id}`,
      {
        headers: {
          "x-actor-id": "cus-status-1",
          "x-actor-roles": "customer",
        },
      }
    );
    assert.equal(ownerRead.status, 200);
    const ownerPayload = await ownerRead.json();
    assert.equal(ownerPayload.ok, true);
    assert.equal(ownerPayload.serviceRequest.status, "requested");

    const unrelatedRead = await fetch(
      `${baseUrl}/api/v1/service-requests/${createdPayload.serviceRequest.id}`,
      {
        headers: {
          "x-actor-id": "cus-status-2",
          "x-actor-roles": "customer",
        },
      }
    );
    assert.equal(unrelatedRead.status, 403);
    const errPayload = await unrelatedRead.json();
    assert.equal(errPayload.error.details.code, "forbidden_actor");
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

test("PATCH /api/v1/reviews/:reviewId edits review for owner in window", async () => {
  await withServer(async (baseUrl) => {
    const create = await fetch(`${baseUrl}/api/reviews`, {
      method: "POST",
      headers: {
        "content-type": "application/json",
        "x-actor-id": "usr_owner1",
        "x-actor-roles": "customer",
      },
      body: JSON.stringify({
        idempotencyKey: "idem-review-edit-1",
        providerUserId: "prov-1",
        rating: 4,
        comment: "Initial",
        serviceCompletedAt: "2026-05-07T10:00:00.000Z",
        now: "2026-05-07T11:00:00.000Z",
      }),
    });
    const created = await create.json();

    const patch = await fetch(`${baseUrl}/api/v1/reviews/${created.review.id}`, {
      method: "PATCH",
      headers: {
        "content-type": "application/json",
        "x-actor-id": "usr_owner1",
        "x-actor-roles": "customer",
      },
      body: JSON.stringify({
        rating: 5,
        comment: "Updated",
        now: "2026-05-07T11:10:00.000Z",
      }),
    });
    assert.equal(patch.status, 200);
    const payload = await patch.json();
    assert.equal(payload.review.rating, 5);
  });
});

test("GET /api/v1/providers/:providerId/reviews lists public verified reviews only", async () => {
  await withServer(async (baseUrl) => {
    const create = await fetch(`${baseUrl}/api/reviews`, {
      method: "POST",
      headers: {
        "content-type": "application/json",
        "x-actor-id": "usr_feed1",
        "x-actor-roles": "customer",
      },
      body: JSON.stringify({
        idempotencyKey: "idem-review-feed-1",
        providerUserId: "prov-1",
        rating: 5,
        serviceCompletedAt: "2026-05-07T10:00:00.000Z",
        now: "2026-05-07T11:00:00.000Z",
      }),
    });
    const created = await create.json();

    await fetch(`${baseUrl}/api/v1/reviews/${created.review.id}/reports`, {
      method: "POST",
      headers: {
        "content-type": "application/json",
        "x-actor-id": "usr_report1",
        "x-actor-roles": "customer",
      },
      body: JSON.stringify({
        idempotencyKey: "idem-report-1",
        reasonCode: "offensive_content",
      }),
    });

    const list = await fetch(`${baseUrl}/api/v1/providers/prov-1/reviews?limit=20`);
    assert.equal(list.status, 200);
    const payload = await list.json();
    assert.equal(payload.ok, true);
    assert.equal(Array.isArray(payload.items), true);
    assert.equal(payload.items.length, 0);
  });
});
