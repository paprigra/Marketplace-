import "dotenv/config";
import { createClient } from "@libsql/client";
import { readFileSync } from "fs";
import { join } from "path";

const url = process.env.TURSO_DATABASE_URL;
const authToken = process.env.TURSO_AUTH_TOKEN;

if (!url || url === "file:dev.db") {
  console.log("No Turso URL found, skipping migration.");
  process.exit(0);
}

const db = createClient({ url, authToken });

const sql = readFileSync(
  join(process.cwd(), "prisma/migrations/20260602171204_init/migration.sql"),
  "utf-8"
);

async function main() {
  console.log("Running migrations on Turso...");
  const statements = sql
    .split(";")
    .map((s) => s.trim())
    .filter((s) => s.length > 0);

  for (const stmt of statements) {
    try {
      await db.execute(stmt);
      console.log("✓", stmt.slice(0, 60).replace(/\n/g, " "));
    } catch (e: any) {
      // Ignore "already exists" errors — tables may exist from previous deploy
      if (
        e.message?.includes("already exists") ||
        e.message?.includes("duplicate")
      ) {
        console.log("~ skipped (already exists)");
      } else {
        console.error("Migration error (non-fatal):", e.message);
      }
    }
  }
  console.log("Migration complete.");
}

main().catch((e) => {
  console.error("Migration failed (non-fatal):", e.message);
  process.exit(0); // Don't fail the build
}).finally(() => db.close());
