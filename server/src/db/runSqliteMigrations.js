import fs from "node:fs";
import path from "node:path";
import { SqliteReviewRepository } from "./sqliteReviewRepository.js";

export function runSqliteMigrations({ dbPath, direction = "up" }) {
  const repository = new SqliteReviewRepository({ filename: dbPath });
  const migrationsDir = direction === "down"
    ? path.resolve("server/migrations/sqlite/down")
    : path.resolve("server/migrations/sqlite");
  const files = getMigrationFiles(migrationsDir, direction);
  for (const file of files) {
    const sql = fs.readFileSync(path.join(migrationsDir, file), "utf8");
    repository.applyMigration(sql);
  }
  return { ok: true, files };
}

if (import.meta.url === `file://${process.argv[1]}`) {
  const dbPath = process.argv[2] ?? "server/.data/reviews.sqlite";
  const direction = process.argv[3] ?? "up";
  const result = runSqliteMigrations({ dbPath, direction });
  process.stdout.write(`migrations_applied=${result.files.length} db=${dbPath}\n`);
}

function getMigrationFiles(migrationsDir, direction) {
  const files = fs.readdirSync(migrationsDir).filter((f) => f.endsWith(".sql")).sort();
  return direction === "down" ? files.reverse() : files;
}
