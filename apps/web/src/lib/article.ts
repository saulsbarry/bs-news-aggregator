import { getDb } from "./pg";
import { formatDistanceToNowStrict } from "date-fns";

export interface ArticleDetail {
  id: string;
  title: string;
  url: string;
  summary: string | null;
  rawContent: string | null;
  imageUrl: string | null;
  publishedAt: Date;
  sourceName: string;
  sourceSlug: string;
  topicPrimary: string | null;
  clusterId: string | null;
  clusterTitle: string | null;
  publishedAtHuman: string;
}

export async function getArticleById(
  articleId: string
): Promise<ArticleDetail | null> {
  const db = await getDb();

  const row = await db.query<{
    id: string;
    title: string;
    url: string;
    summary: string | null;
    raw_content: string | null;
    image_url: string | null;
    published_at: Date;
    source_name: string;
    source_slug: string;
    topic_primary: string | null;
    cluster_id: string | null;
    cluster_title: string | null;
  }>(
    `
    SELECT a.id, a.title, a.url, a.summary, a.raw_content, a.image_url, a.published_at,
           s.name AS source_name, s.slug AS source_slug, a.topic_primary,
           c.id AS cluster_id, c.main_title AS cluster_title
    FROM articles a
    JOIN sources s ON s.id = a.source_id
    LEFT JOIN cluster_articles ca ON ca.article_id = a.id
    LEFT JOIN clusters c ON c.id = ca.cluster_id
    WHERE a.id = $1 AND a.is_visible = TRUE
    ORDER BY ca.is_primary DESC NULLS LAST
    LIMIT 1
  `,
    [articleId]
  );

  const r = row.rows[0];
  if (!r) return null;

  return {
    id: r.id,
    title: r.title,
    url: r.url,
    summary: r.summary,
    rawContent: r.raw_content,
    imageUrl: r.image_url,
    publishedAt: r.published_at,
    sourceName: r.source_name,
    sourceSlug: r.source_slug,
    topicPrimary: r.topic_primary,
    clusterId: r.cluster_id,
    clusterTitle: r.cluster_title,
    publishedAtHuman: formatDistanceToNowStrict(r.published_at, {
      addSuffix: true
    })
  };
}
