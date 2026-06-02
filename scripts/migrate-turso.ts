import "dotenv/config";
import { createClient } from "@libsql/client";
import { readFileSync } from "fs";
import { join } from "path";

const url = process.env.TURSO_DATABASE_URL!;
const authToken = process.env.TURSO_AUTH_TOKEN;

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
      console.log("✓", stmt.slice(0, 50).replace(/\n/g, " "));
    } catch (e: any) {
      if (e.message?.includes("already exists")) {
        console.log("~ already exists, skipping");
      } else {
        throw e;
      }
    }
  }
  console.log("Migration done!");
}

main().catch(console.error).finally(() => db.close());
