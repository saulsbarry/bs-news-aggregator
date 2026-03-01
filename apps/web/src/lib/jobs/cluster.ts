import { getDb } from "../pg";

const SIMILARITY_THRESHOLD = 0.82;
const RECENT_HOURS = 48;

export interface ClusterResult {
  clustered: number;
  created: number;
}

/**
 * For each article that has an embedding but is not in any cluster,
 * find similar recent articles. If one is in a cluster, add this article to that cluster;
 * otherwise create a new cluster with this article as primary.
 */
export async function runClustering(): Promise<ClusterResult> {
  const db = await getDb();

  const { rows: unclustered } = await db.query<{ article_id: string }>(
    `
    SELECT ae.article_id
    FROM article_embeddings ae
    WHERE NOT EXISTS (
      SELECT 1 FROM cluster_articles ca WHERE ca.article_id = ae.article_id
    )
    ORDER BY ae.article_id
    LIMIT 50
  `
  );

  let clustered = 0;
  let created = 0;

  for (const { article_id } of unclustered) {
    const result = await clusterArticle(db, article_id);
    if (result === "created") created += 1;
    if (result === "joined" || result === "created") clustered += 1;
  }

  return { clustered, created };
}

type ClusterOutcome = "joined" | "created" | "skipped";

async function clusterArticle(
  db: Awaited<ReturnType<typeof getDb>>,
  articleId: string
): Promise<ClusterOutcome> {
  const since = new Date(Date.now() - RECENT_HOURS * 60 * 60 * 1000);

  const similar = await db.query<{ cluster_id: string; distance: number }>(
    `
    WITH my_embedding AS (
      SELECT embedding FROM article_embeddings WHERE article_id = $1
    )
    SELECT ca.cluster_id, (ae.embedding <=> (SELECT embedding FROM my_embedding)) AS distance
    FROM article_embeddings ae
    JOIN articles a ON a.id = ae.article_id
    JOIN cluster_articles ca ON ca.article_id = ae.article_id
    WHERE ae.article_id != $1
      AND a.published_at >= $2
    ORDER BY ae.embedding <=> (SELECT embedding FROM my_embedding)
    LIMIT 1
  `,
    [articleId, since]
  );

  const best = similar.rows[0];
  if (best && best.distance <= 1 - SIMILARITY_THRESHOLD) {
    await db.query(
      `
      INSERT INTO cluster_articles (cluster_id, article_id, is_primary)
      VALUES ($1, $2, FALSE)
      ON CONFLICT (cluster_id, article_id) DO NOTHING
    `,
      [best.cluster_id, articleId]
    );
    await db.query(
      `UPDATE clusters SET updated_at = NOW() WHERE id = $1`,
      [best.cluster_id]
    );
    return "joined";
  }

  const article = await db.query<{ title: string; summary: string | null; topic_primary: string | null }>(
    `SELECT title, summary, topic_primary FROM articles WHERE id = $1`,
    [articleId]
  );
  const row = article.rows[0];
  if (!row) return "skipped";

  const clusterRes = await db.query<{ id: string }>(
    `
    INSERT INTO clusters (main_title, summary, topic_primary, hot_score)
    VALUES ($1, $2, $3, 0)
    RETURNING id
  `,
    [row.title, row.summary, row.topic_primary]
  );
  const clusterId = clusterRes.rows[0]?.id;
  if (!clusterId) return "skipped";

  await db.query(
    `
    INSERT INTO cluster_articles (cluster_id, article_id, is_primary)
    VALUES ($1, $2, TRUE)
    ON CONFLICT (cluster_id, article_id) DO NOTHING
  `,
    [clusterId, articleId]
  );
  return "created";
}
