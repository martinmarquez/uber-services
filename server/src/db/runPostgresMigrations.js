import fs from "node:fs";
import path from "node:path";
import { execFileSync } from "node:child_process";

export function runPostgresMigrations({ databaseUrl, schema = "public" }) {
  const sqlPath = path.resolve("server/migrations/001_reviews_core.sql");
  const sql = fs.readFileSync(sqlPath, "utf8");
  const wrapped = `create schema if not exists ${ident(schema)}; set search_path to ${ident(schema)}; ${sql}`;
  psql(databaseUrl, wrapped);
  return { ok: true, files: [sqlPath], schema };
}

if (import.meta.url === `file://${process.argv[1]}`) {
  const databaseUrl = process.argv[2] ?? process.env.DATABASE_URL;
  const schema = process.argv[3] ?? process.env.PG_SCHEMA ?? "public";
  if (!databaseUrl) {
    process.stderr.write("DATABASE_URL required\n");
    process.exit(1);
  }
  const result = runPostgresMigrations({ databaseUrl, schema });
  process.stdout.write(`migrations_applied=${result.files.length} schema=${result.schema}\n`);
}

function psql(databaseUrl, sql) {
  execFileSync("psql", ["-X", "-v", "ON_ERROR_STOP=1", "-d", databaseUrl, "-c", sql], { stdio: "pipe" });
}

function ident(value) {
  return `"${String(value).replace(/"/g, "\"\"")}"`;
}
