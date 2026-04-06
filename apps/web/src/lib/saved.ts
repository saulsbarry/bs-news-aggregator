import { getDb } from "./pg";

export async function getSavedArticles(userId: string) {
  const db = await getDb();
  type Row = {
    id: string;
    title: string;
    url: string;
    summary: string | null;
    source_name: string;
    published_at: Date;
    cluster_id: string | null;
    cluster_title: string | null;
    saved_at: Date;
  };
  const { rows } = await db.query<Row>(
    `SELECT
       a.id,
       a.title,
       a.url,
       a.summary,
       s.name AS source_name,
       a.published_at,
       a.cluster_id,
       c.main_title AS cluster_title,
       sa.saved_at
     FROM saved_articles sa
     JOIN articles a ON a.id = sa.article_id
     JOIN sources s ON s.id = a.source_id
     LEFT JOIN clusters c ON c.id = a.cluster_id
     WHERE sa.user_id = $1
     ORDER BY sa.saved_at DESC`,
    [userId]
  );
  return rows;
}

export async function saveArticle(userId: string, articleId: string): Promise<void> {
  const db = await getDb();
  await db.query(
    `INSERT INTO saved_articles (user_id, article_id)
     VALUES ($1, $2)
     ON CONFLICT DO NOTHING`,
    [userId, articleId]
  );
}

export async function unsaveArticle(userId: string, articleId: string): Promise<void> {
  const db = await getDb();
  await db.query(
    `DELETE FROM saved_articles WHERE user_id = $1 AND article_id = $2`,
    [userId, articleId]
  );
}

export async function isArticleSaved(userId: string, articleId: string): Promise<boolean> {
  const db = await getDb();
  const { rows } = await db.query(
    `SELECT 1 FROM saved_articles WHERE user_id = $1 AND article_id = $2`,
    [userId, articleId]
  );
  return rows.length > 0;
}

export async function getSavedArticleIds(userId: string, articleIds: string[]): Promise<Set<string>> {
  if (articleIds.length === 0) return new Set();
  const db = await getDb();
  const { rows } = await db.query<{ article_id: string }>(
    `SELECT article_id FROM saved_articles
     WHERE user_id = $1 AND article_id = ANY($2::uuid[])`,
    [userId, articleIds]
  );
  return new Set(rows.map((r) => r.article_id));
}
