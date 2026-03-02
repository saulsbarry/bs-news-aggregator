import { Pool } from "pg";

let pool: Pool | null = null;

export async function getDb(): Promise<Pool> {
  if (!pool) {
    const connectionString =
      process.env.DATABASE_URL ??
      "postgres://postgres:postgres@localhost:5432/bs_news_aggregator";

    pool = new Pool({
      connectionString,
      max: 1
    });
  }

  return pool;
}

