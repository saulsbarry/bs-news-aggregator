import { getDb } from "./pg";

export interface SearchFilters {
  topic?: string;
  sourceId?: string;
  timeRange?: "6h" | "12h" | "24h" | "48h" | "7d";
}

export interface SearchHit {
  id: string;
  title: string;
  url: string;
  summary: string | null;
  imageUrl: string | null;
  publishedAt: Date;
  sourceName: string;
  sourceSlug: string;
  clusterId: string | null;
  clusterTitle: string | null;
}

export interface SearchResult {
  hits: SearchHit[];
}

export async function searchArticles(
  q: string,
  filters: SearchFilters,
  limit: number
): Promise<SearchResult> {
  const db = await getDb();

  const intervalMap: Record<NonNullable<SearchFilters["timeRange"]>, string> = {
    "6h": "6 hours",
    "12h": "12 hours",
    "24h": "24 hours",
    "48h": "48 hours",
    "7d": "7 days",
  };

  const params: (string | number)[] = [];
  let paramIndex = 0;
  const conditions: string[] = ["a.is_visible = TRUE"];

  if (filters.topic) {
    paramIndex += 1;
    conditions.push(`a.topic_primary = $${paramIndex}`);
    params.push(filters.topic);
  }
  if (filters.sourceId) {
    paramIndex += 1;
    conditions.push(`a.source_id = $${paramIndex}`);
    params.push(filters.sourceId);
  }
  if (filters.timeRange) {
    conditions.push(`a.published_at >= NOW() - INTERVAL '${intervalMap[filters.timeRange]}'`);
  }

  const whereClause =
    conditions.length > 0 ? `AND ${conditions.join(" AND ")}` : "";

  type HitRow = {
    id: string;
    title: string;
    url: string;
    summary: string | null;
    image_url: string | null;
    published_at: Date;
    source_name: string;
    source_slug: string;
    cluster_id: string | null;
    cluster_title: string | null;
  };

  if (!q.trim()) {
    params.push(limit);
    const limitNum = params.length;
    const rows = await db.query<HitRow>(
      `
      SELECT a.id, a.title, a.url, a.summary, a.image_url, a.published_at,
             s.name AS source_name, s.slug AS source_slug,
             c.id AS cluster_id, c.main_title AS cluster_title
      FROM articles a
      JOIN sources s ON s.id = a.source_id
      LEFT JOIN cluster_articles ca ON ca.article_id = a.id
      LEFT JOIN clusters c ON c.id = ca.cluster_id
      WHERE 1=1 ${whereClause}
      ORDER BY a.published_at DESC
      LIMIT $${limitNum}
    `,
      params
    );
    return {
      hits: rows.rows.map((r: HitRow) => ({
        id: r.id,
        title: r.title,
        url: r.url,
        summary: r.summary,
        imageUrl: r.image_url,
        publishedAt: r.published_at,
        sourceName: r.source_name,
        sourceSlug: r.source_slug,
        clusterId: r.cluster_id,
        clusterTitle: r.cluster_title
      }))
    };
  }

  const queryParam = q.trim();
  params.push(queryParam);
  params.push(limit);
  const queryNum = params.length - 1;
  const limitNum = params.length;

  const rows = await db.query<HitRow>(
    `
    SELECT a.id, a.title, a.url, a.summary, a.image_url, a.published_at,
           s.name AS source_name, s.slug AS source_slug,
           c.id AS cluster_id, c.main_title AS cluster_title
    FROM articles a
    JOIN sources s ON s.id = a.source_id
    LEFT JOIN cluster_articles ca ON ca.article_id = a.id
    LEFT JOIN clusters c ON c.id = ca.cluster_id
    WHERE a.search_vector @@ plainto_tsquery('simple', $${queryNum})
      ${whereClause}
    ORDER BY ts_rank(a.search_vector, plainto_tsquery('simple', $${queryNum})) DESC,
             a.published_at DESC
    LIMIT $${limitNum}
  `,
    params
  );

  return {
    hits: rows.rows.map((r: HitRow) => ({
      id: r.id,
      title: r.title,
      url: r.url,
      summary: r.summary,
      imageUrl: r.image_url,
      publishedAt: r.published_at,
      sourceName: r.source_name,
      sourceSlug: r.source_slug,
      clusterId: r.cluster_id,
      clusterTitle: r.cluster_title
    }))
  };
}
