import { getDb } from "./pg";
import { cacheGet, cacheSet } from "./cache";

export interface TrendingTopic {
  topic: string;
  clusterCount: number;
  totalHotScore: number;
}

export async function getTrendingTopics(): Promise<TrendingTopic[]> {
  const cacheKey = "trending:v1";
  const cached = await cacheGet<TrendingTopic[]>(cacheKey);
  if (cached) return cached;

  const db = await getDb();

  type Row = {
    topic: string;
    cluster_count: string;
    total_hot_score: string;
  };

  const { rows } = await db.query<Row>(`
    SELECT
      c.topic_primary AS topic,
      COUNT(DISTINCT c.id) AS cluster_count,
      SUM(c.hot_score) AS total_hot_score
    FROM clusters c
    JOIN cluster_articles ca ON ca.cluster_id = c.id
    JOIN articles a ON a.id = ca.article_id
    WHERE
      c.topic_primary IS NOT NULL
      AND a.published_at >= NOW() - INTERVAL '24 hours'
      AND a.is_visible = TRUE
    GROUP BY c.topic_primary
    ORDER BY total_hot_score DESC
    LIMIT 10
  `);

  const result: TrendingTopic[] = rows.map((row) => ({
    topic: row.topic,
    clusterCount: Number(row.cluster_count),
    totalHotScore: Number(row.total_hot_score),
  }));

  await cacheSet(cacheKey, result, 300);
  return result;
}
