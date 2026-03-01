import { readFile } from "node:fs/promises";
import { resolve, dirname } from "node:path";
import { fileURLToPath } from "node:url";
import { Pool } from "pg";

const __dirname = dirname(fileURLToPath(import.meta.url));

async function main() {
  const schemaPath = resolve(__dirname, "../../../infra/db/schema.sql");
  const sql = await readFile(schemaPath, "utf8");

  const connectionString =
    process.env.DATABASE_URL ??
    "postgres://postgres:postgres@localhost:5432/bs_news_aggregator";

  const pool = new Pool({ connectionString });

  try {
    console.log("Applying database schema from", schemaPath);
    await pool.query(sql);
    console.log("Database schema applied successfully.");
  } finally {
    await pool.end();
  }
}

main().catch((err) => {
  console.error("Failed to apply database schema:", err);
  process.exit(1);
});

