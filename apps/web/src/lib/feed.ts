import { getDb } from "./pg";
import { formatDistanceToNowStrict } from "date-fns";

export interface RankedCluster {
  id: string;
  mainTitle: string | null;
  summary: string | null;
  primaryTopic: string | null;
  articleCount: number;
  sourceNames: string[];
  lastUpdatedHuman: string | null;
}

export interface RankedFeed {
  clusters: RankedCluster[];
}

export interface FeedFilters {
  topics?: string[];
  sourceIds?: string[];
  timeRange?: "24h" | "48h" | "7d";
}

export async function getRankedFeed(
  opts: {
    limit: number;
    offset: number;
  } & FeedFilters
): Promise<RankedFeed> {
  const db = await getDb();

  const since =
    opts.timeRange === "24h"
      ? new Date(Date.now() - 24 * 60 * 60 * 1000)
      : opts.timeRange === "48h"
        ? new Date(Date.now() - 48 * 60 * 60 * 1000)
        : opts.timeRange === "7d"
          ? new Date(Date.now() - 7 * 24 * 60 * 60 * 1000)
          : null;

  const params: unknown[] = [];
  let paramIndex = 0;
  const conditions: string[] = ["a.is_visible = TRUE"];

  if (opts.topics && opts.topics.length > 0) {
    paramIndex += 1;
    conditions.push(`c.topic_primary = ANY($${paramIndex}::text[])`);
    params.push(opts.topics);
  }
  if (opts.sourceIds && opts.sourceIds.length > 0) {
    paramIndex += 1;
    conditions.push(`a.source_id = ANY($${paramIndex}::uuid[])`);
    params.push(opts.sourceIds);
  }
  if (since) {
    paramIndex += 1;
    conditions.push(`a.published_at >= $${paramIndex}`);
    params.push(since);
  }

  const whereClause =
    conditions.length > 0 ? `WHERE ${conditions.join(" AND ")}` : "";
  paramIndex += 1;
  params.push(opts.limit);
  paramIndex += 1;
  params.push(opts.offset);

  type FeedRow = {
    id: string;
    main_title: string | null;
    summary: string | null;
    topic_primary: string | null;
    article_count: number;
    source_names: string[] | null;
    last_article_published_at: Date | null;
  };

  const rows = await db.query<FeedRow>(
    `
    SELECT
      c.id,
      c.main_title,
      c.summary,
      c.topic_primary,
      COUNT(a.id) AS article_count,
      ARRAY_AGG(DISTINCT s.name) AS source_names,
      MAX(a.published_at) AS last_article_published_at
    FROM clusters c
    JOIN cluster_articles ca ON ca.cluster_id = c.id
    JOIN articles a ON a.id = ca.article_id
    JOIN sources s ON s.id = a.source_id
    ${whereClause}
    GROUP BY c.id
    ORDER BY c.hot_score DESC, last_article_published_at DESC
    LIMIT $${paramIndex - 1} OFFSET $${paramIndex}
  `,
    params
  );

  return {
    clusters: rows.rows.map((row: FeedRow) => ({
      id: row.id,
      mainTitle: row.main_title,
      summary: row.summary,
      primaryTopic: row.topic_primary,
      articleCount: Number(row.article_count),
      sourceNames: row.source_names ?? [],
      lastUpdatedHuman: row.last_article_published_at
        ? formatDistanceToNowStrict(row.last_article_published_at, {
            addSuffix: true
          })
        : null
    }))
  };
}
