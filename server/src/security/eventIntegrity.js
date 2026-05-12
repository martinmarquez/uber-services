import crypto from "node:crypto";

const DEFAULT_ALGORITHM = "RSA-SHA256";
const DEFAULT_KEY_ID = "local-dev-key";

export function defaultEventSigner(options = {}) {
  const nodeEnv = options.nodeEnv ?? process.env.NODE_ENV ?? "development";
  const requireAsymmetricKey = options.requireAsymmetricKey ?? !isNonProductionEnv(nodeEnv);
  const privateKeyPem = options.privateKeyPem ?? process.env.EVENT_SIGNING_PRIVATE_KEY_PEM;
  const keyId = options.keyId ?? process.env.EVENT_SIGNING_KEY_ID ?? (requireAsymmetricKey ? null : DEFAULT_KEY_ID);
  const algorithm = options.algorithm ?? DEFAULT_ALGORITHM;

  if (requireAsymmetricKey && (!privateKeyPem || !keyId)) {
    throw new Error("EVENT_SIGNING_PRIVATE_KEY_PEM and EVENT_SIGNING_KEY_ID are required outside development/test");
  }

  if (!privateKeyPem) return hmacFallbackSigner(options.hmacKey);

  return {
    signDigest(digestHex) {
      const signature = crypto.sign(algorithm, Buffer.from(digestHex, "hex"), privateKeyPem).toString("base64");
      return { signature, keyId, algorithm };
    },
  };
}

export function verifyEventChain(events, resolvePublicKeyById) {
  if (!Array.isArray(events)) return { ok: false, code: "invalid_events_payload", index: 0 };

  let expectedPreviousHash = null;
  for (let index = 0; index < events.length; index += 1) {
    const event = events[index];
    const {
      integrityHash,
      signature,
      signatureAlgorithm,
      signatureKeyId,
      ...envelope
    } = event ?? {};
    const previousEventHash = envelope.previousEventHash ?? null;

    if (!integrityHash || !signature || !signatureAlgorithm || !signatureKeyId) {
      return { ok: false, code: "missing_integrity_fields", index };
    }
    if (previousEventHash !== expectedPreviousHash) {
      return { ok: false, code: "chain_link_mismatch", index };
    }

    const recomputedHash = crypto.createHash("sha256").update(JSON.stringify(envelope)).digest("hex");
    if (recomputedHash !== integrityHash) {
      return { ok: false, code: "event_payload_tampered", index };
    }

    const verificationMaterial = resolvePublicKeyById?.(signatureKeyId, signatureAlgorithm, event);
    const validSignature = verifySignature({
      signatureAlgorithm,
      integrityHash,
      signature,
      verificationMaterial,
    });
    if (validSignature === null) {
      return { ok: false, code: "verification_material_not_found", index };
    }
    if (!validSignature) return { ok: false, code: "invalid_signature", index };

    expectedPreviousHash = integrityHash;
  }

  return { ok: true, verifiedEvents: events.length };
}

function hmacFallbackSigner(secret = process.env.EVENT_SIGNING_FALLBACK_HMAC_KEY ?? crypto.randomBytes(32).toString("hex")) {
  return {
    signDigest(digestHex) {
      const signature = crypto.createHmac("sha256", secret).update(digestHex).digest("hex");
      return {
        signature,
        keyId: "hmac-fallback",
        algorithm: "HMAC-SHA256",
      };
    },
  };
}

function verifySignature({ signatureAlgorithm, integrityHash, signature, verificationMaterial }) {
  if (!verificationMaterial) return null;

  if (signatureAlgorithm === "HMAC-SHA256") {
    const expected = crypto.createHmac("sha256", verificationMaterial).update(integrityHash).digest("hex");
    const expectedBuffer = Buffer.from(expected, "utf8");
    const signatureBuffer = Buffer.from(signature, "utf8");
    if (expectedBuffer.length !== signatureBuffer.length) return false;
    return crypto.timingSafeEqual(expectedBuffer, signatureBuffer);
  }

  return crypto.verify(
    signatureAlgorithm,
    Buffer.from(integrityHash, "hex"),
    verificationMaterial,
    Buffer.from(signature, "base64"),
  );
}

function isNonProductionEnv(env) {
  const normalized = String(env).toLowerCase();
  return normalized === "development" || normalized === "test";
}
