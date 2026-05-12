#!/usr/bin/env node
import fs from "node:fs";

if (process.argv.length < 3) {
  console.error("Usage: node tools/guardrails/actor-signing-monitoring-summary.js <ndjson_log_file>");
  process.exit(1);
}

const filePath = process.argv[2];
const content = fs.readFileSync(filePath, "utf8");
const lines = content.split(/\r?\n/).filter(Boolean);

const codes = {
  actor_signature_required: 0,
  invalid_actor_signature: 0,
  actor_signature_expired: 0,
  invalid_actor_timestamp: 0,
  other_authentication_error: 0,
};

let totalAuthErrors = 0;

for (const line of lines) {
  let item;
  try {
    item = JSON.parse(line);
  } catch {
    continue;
  }

  const errorCode = item?.error?.code ?? item?.payload?.error?.code;
  const detailCode = item?.error?.details?.code ?? item?.payload?.error?.details?.code;

  if (errorCode !== "AUTHENTICATION_ERROR") continue;

  totalAuthErrors += 1;

  if (detailCode in codes && detailCode !== "other_authentication_error") {
    codes[detailCode] += 1;
    continue;
  }

  codes.other_authentication_error += 1;
}

console.log(JSON.stringify({
  totalAuthErrors,
  breakdown: codes,
}, null, 2));
