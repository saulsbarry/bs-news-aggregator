import { getDb } from "../pg";

/**
 * Recompute hot_score for all clusters from:
 * - Freshness (recent articles)
 * - Cluster size (number of articles)
 * - Source diversity / priority (from source priority_score)
 */
export async function updateHotScores(): Promise<void> {
  const db = await getDb();

  await db.query(`
    WITH cluster_metrics AS (
      SELECT
        c.id,
        COUNT(ca.article_id) AS article_count,
        MAX(a.published_at) AS last_published,
        COALESCE(SUM(s.priority_score), 0) AS source_score
      FROM clusters c
      JOIN cluster_articles ca ON ca.cluster_id = c.id
      JOIN articles a ON a.id = ca.article_id
      JOIN sources s ON s.id = a.source_id
      GROUP BY c.id
    ),
    scored AS (
      SELECT
        id,
        article_count::real * 0.4
          + LEAST(EXTRACT(EPOCH FROM (NOW() - last_published)) / 3600, 72) * (-0.02) + 1.5
          + LEAST(source_score * 0.1, 2) AS new_score
      FROM cluster_metrics
    )
    UPDATE clusters c
    SET hot_score = s.new_score
    FROM scored s
    WHERE c.id = s.id
  `);
}
