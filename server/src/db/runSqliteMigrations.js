import fs from "node:fs";
import path from "node:path";
import { SqliteReviewRepository } from "./sqliteReviewRepository.js";

export function runSqliteMigrations({ dbPath }) {
  const repository = new SqliteReviewRepository({ filename: dbPath });
  const migrationsDir = path.resolve("server/migrations/sqlite");
  const files = fs.readdirSync(migrationsDir).filter((f) => f.endsWith(".sql")).sort();
  for (const file of files) {
    const sql = fs.readFileSync(path.join(migrationsDir, file), "utf8");
    repository.applyMigration(sql);
  }
  return { ok: true, files };
}

if (import.meta.url === `file://${process.argv[1]}`) {
  const dbPath = process.argv[2] ?? "server/.data/reviews.sqlite";
  const result = runSqliteMigrations({ dbPath });
  process.stdout.write(`migrations_applied=${result.files.length} db=${dbPath}\n`);
}
