import crypto from "node:crypto";

const DEFAULT_MAX_SKEW_SECONDS = 300;

export function resolveActorFromHeaders(headers, options = {}) {
  const actorId = headerFirst(headers["x-actor-id"]);
  const actorRolesRaw = headerFirst(headers["x-actor-roles"]);
  const roles = typeof actorRolesRaw === "string"
    ? actorRolesRaw.split(",").map((item) => item.trim()).filter(Boolean)
    : [];

  if (!actorId) return { actor: null, errorCode: null };

  const actor = { id: actorId, roles };
  const secret = options.secret ?? process.env.ACTOR_SIGNING_SECRET ?? null;
  if (!secret) return { actor, errorCode: null };

  const issuedAtRaw = headerFirst(headers["x-actor-ts"]);
  const signature = headerFirst(headers["x-actor-sig"]);
  if (!issuedAtRaw || !signature) return { actor: null, errorCode: "actor_signature_required" };

  const issuedAt = Number(issuedAtRaw);
  if (!Number.isFinite(issuedAt)) return { actor: null, errorCode: "invalid_actor_timestamp" };

  const nowSeconds = Math.floor(Date.now() / 1000);
  const maxSkewSeconds = Number(options.maxSkewSeconds ?? DEFAULT_MAX_SKEW_SECONDS);
  if (Math.abs(nowSeconds - issuedAt) > maxSkewSeconds) {
    return { actor: null, errorCode: "actor_signature_expired" };
  }

  const payload = `${actorId}|${roles.join(",")}|${issuedAtRaw}`;
  const expected = crypto.createHmac("sha256", secret).update(payload).digest("hex");
  const actual = String(signature).trim();
  if (!safeEqualHex(expected, actual)) return { actor: null, errorCode: "invalid_actor_signature" };

  return { actor, errorCode: null };
}

function safeEqualHex(a, b) {
  if (typeof a !== "string" || typeof b !== "string") return false;
  if (a.length !== b.length) return false;
  return crypto.timingSafeEqual(Buffer.from(a, "utf8"), Buffer.from(b, "utf8"));
}

function headerFirst(value) {
  if (Array.isArray(value)) return value[0];
  return value;
}
