import { getDb } from "./pg";
import { formatDistanceToNowStrict } from "date-fns";

export interface ClusterArticle {
  id: string;
  title: string;
  url: string;
  summary: string | null;
  imageUrl: string | null;
  publishedAt: Date;
  sourceName: string;
  sourceSlug: string;
  isPrimary: boolean;
}

export interface ClusterDetail {
  id: string;
  mainTitle: string | null;
  summary: string | null;
  primaryTopic: string | null;
  articles: ClusterArticle[];
  lastUpdatedHuman: string | null;
  lastPublishedAt: Date | null;
}

export async function getClusterById(
  clusterId: string
): Promise<ClusterDetail | null> {
  const db = await getDb();

  const clusterRow = await db.query<{
    id: string;
    main_title: string | null;
    summary: string | null;
    topic_primary: string | null;
    last_published: Date | null;
  }>(
    `
    SELECT c.id, c.main_title, c.summary, c.topic_primary,
           MAX(a.published_at) AS last_published
    FROM clusters c
    JOIN cluster_articles ca ON ca.cluster_id = c.id
    JOIN articles a ON a.id = ca.article_id
    WHERE c.id = $1 AND a.is_visible = TRUE
    GROUP BY c.id
  `,
    [clusterId]
  );

  const c = clusterRow.rows[0];
  if (!c) return null;

  type ArticleRow = {
    id: string;
    title: string;
    url: string;
    summary: string | null;
    image_url: string | null;
    published_at: Date;
    source_name: string;
    source_slug: string;
    is_primary: boolean;
  };

  const articlesRow = await db.query<ArticleRow>(
    `
    SELECT a.id, a.title, a.url, a.summary, a.image_url, a.published_at,
           s.name AS source_name, s.slug AS source_slug, ca.is_primary
    FROM cluster_articles ca
    JOIN articles a ON a.id = ca.article_id
    JOIN sources s ON s.id = a.source_id
    WHERE ca.cluster_id = $1 AND a.is_visible = TRUE
    ORDER BY ca.is_primary DESC, a.published_at DESC
  `,
    [clusterId]
  );

  return {
    id: c.id,
    mainTitle: c.main_title,
    summary: c.summary,
    primaryTopic: c.topic_primary,
    lastPublishedAt: c.last_published,
    lastUpdatedHuman: c.last_published
      ? formatDistanceToNowStrict(c.last_published, { addSuffix: true })
      : null,
    articles: articlesRow.rows.map((r: ArticleRow) => ({
      id: r.id,
      title: r.title,
      url: r.url,
      summary: r.summary,
      imageUrl: r.image_url,
      publishedAt: r.published_at,
      sourceName: r.source_name,
      sourceSlug: r.source_slug,
      isPrimary: r.is_primary
    }))
  };
}
