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
    engagement AS (
      SELECT cluster_id, COUNT(*) AS click_count
      FROM user_events
      WHERE event_type = 'cluster_click'
        AND created_at >= NOW() - INTERVAL '24 hours'
      GROUP BY cluster_id
    ),
    scored AS (
      SELECT
        cm.id,
        LEAST(cm.article_count::real, 10) * 0.4
          + LEAST(EXTRACT(EPOCH FROM (NOW() - cm.last_published)) / 3600, 72) * (-0.02) + 1.5
          + LEAST(cm.source_score * 0.1, 2)
          + LEAST(COALESCE(e.click_count, 0) * 0.05, 1) AS new_score
      FROM cluster_metrics cm
      LEFT JOIN engagement e ON e.cluster_id = cm.id
    )
    UPDATE clusters c
    SET hot_score = s.new_score
    FROM scored s
    WHERE c.id = s.id
  `);
}
