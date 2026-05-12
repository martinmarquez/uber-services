import test from "node:test";
import assert from "node:assert/strict";
import crypto from "node:crypto";
import { resolveActorFromHeaders } from "../src/security/actorAuth.js";
import { createActorSignatureHeaders } from "../src/security/actorSignature.js";

function buildSignedHeaders({ actorId, roles, secret, ts }) {
  const roleValue = roles.join(",");
  const payload = `${actorId}|${roleValue}|${String(ts)}`;
  const signature = crypto.createHmac("sha256", secret).update(payload).digest("hex");
  return {
    "x-actor-id": actorId,
    "x-actor-roles": roleValue,
    "x-actor-ts": String(ts),
    "x-actor-sig": signature,
  };
}

test("resolveActorFromHeaders returns actor when no secret is configured", () => {
  const result = resolveActorFromHeaders({
    "x-actor-id": "usr-1",
    "x-actor-roles": "customer,moderator",
  });
  assert.equal(result.errorCode, null);
  assert.deepEqual(result.actor, { id: "usr-1", roles: ["customer", "moderator"] });
});

test("resolveActorFromHeaders rejects invalid signature when secret is configured", () => {
  const result = resolveActorFromHeaders({
    "x-actor-id": "usr-2",
    "x-actor-roles": "customer",
    "x-actor-ts": String(Math.floor(Date.now() / 1000)),
    "x-actor-sig": "bad",
  }, { secret: "actor-secret" });
  assert.equal(result.actor, null);
  assert.equal(result.errorCode, "invalid_actor_signature");
});

test("resolveActorFromHeaders accepts valid signature when secret is configured", () => {
  const now = Math.floor(Date.now() / 1000);
  const headers = buildSignedHeaders({
    actorId: "usr-3",
    roles: ["customer"],
    secret: "actor-secret",
    ts: now,
  });
  const result = resolveActorFromHeaders(headers, { secret: "actor-secret" });
  assert.equal(result.errorCode, null);
  assert.deepEqual(result.actor, { id: "usr-3", roles: ["customer"] });
});

test("resolveActorFromHeaders rejects expired signature", () => {
  const oldTs = Math.floor(Date.now() / 1000) - 3600;
  const headers = buildSignedHeaders({
    actorId: "usr-4",
    roles: ["customer"],
    secret: "actor-secret",
    ts: oldTs,
  });
  const result = resolveActorFromHeaders(headers, { secret: "actor-secret", maxSkewSeconds: 300 });
  assert.equal(result.actor, null);
  assert.equal(result.errorCode, "actor_signature_expired");
});

test("createActorSignatureHeaders generates headers accepted by verifier", () => {
  const ts = Math.floor(Date.now() / 1000);
  const headers = createActorSignatureHeaders({
    actorId: "usr-5",
    roles: ["customer", "moderator"],
    secret: "actor-secret",
    ts,
  });

  const result = resolveActorFromHeaders(headers, {
    secret: "actor-secret",
    maxSkewSeconds: 300,
  });

  assert.equal(result.errorCode, null);
  assert.deepEqual(result.actor, { id: "usr-5", roles: ["customer", "moderator"] });
});
