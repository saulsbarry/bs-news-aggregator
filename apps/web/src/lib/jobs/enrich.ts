import { getDb } from "../pg";
import { summarize, embed } from "../ai/client";
import { toCanonicalTopic } from "../constants";

const ENRICH_BATCH_SIZE = 75;
const ENRICH_CONCURRENCY = 5;
const EMBEDDING_MODEL_NAME = "text-embedding-3-small";

export interface EnrichResult {
  enriched: number;
  failed: number;
}

export async function runEnrichment(): Promise<EnrichResult> {
  const db = await getDb();

  const { rows: pending } = await db.query<{
    id: string;
    title: string;
    summary: string | null;
    raw_content: string | null;
  }>(
    `
    SELECT a.id, a.title, a.summary, a.raw_content
    FROM articles a
    LEFT JOIN article_embeddings ae ON ae.article_id = a.id
    WHERE ae.article_id IS NULL
      AND a.is_visible = TRUE
      AND a.published_at >= NOW() - INTERVAL '24 hours'
    ORDER BY a.published_at DESC
    LIMIT $1
  `,
    [ENRICH_BATCH_SIZE]
  );

  let enriched = 0;
  let failed = 0;

  async function enrichOne(row: typeof pending[number]): Promise<boolean> {
    const text = [row.title, row.summary, row.raw_content]
      .filter(Boolean)
      .join("\n\n");

    const [summaryResult, vector] = await Promise.all([
      summarize(text),
      embed(text),
    ]);

    if (summaryResult) {
      await db.query(
        `
        UPDATE articles
        SET summary = $1,
            topic_primary = $2,
            topics = $3
        WHERE id = $4
      `,
        [
          summaryResult.summary,
          toCanonicalTopic(summaryResult.topics),
          summaryResult.topics.length ? JSON.stringify(summaryResult.topics) : null,
          row.id,
        ]
      );
    }

    if (vector && vector.length === 1536) {
      const vecStr = `[${vector.join(",")}]`;
      await db.query(
        `
        INSERT INTO article_embeddings (article_id, embedding, model_name)
        VALUES ($1, $2::vector, $3)
        ON CONFLICT (article_id) DO UPDATE
        SET embedding = EXCLUDED.embedding,
            model_name = EXCLUDED.model_name
      `,
        [row.id, vecStr, EMBEDDING_MODEL_NAME]
      );
      await db.query(
        `UPDATE articles SET raw_content = NULL WHERE id = $1`,
        [row.id]
      );
    }

    return true;
  }

  // Process in parallel with capped concurrency
  const queue = [...pending];
  async function worker() {
    while (queue.length > 0) {
      const row = queue.shift()!;
      try {
        await enrichOne(row);
        enriched += 1;
      } catch {
        failed += 1;
      }
    }
  }

  await Promise.all(
    Array.from({ length: ENRICH_CONCURRENCY }, () => worker())
  );

  return { enriched, failed };
}
