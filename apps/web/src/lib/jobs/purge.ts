import { getDb } from "../pg";

const ARTICLE_RETENTION_DAYS = 14;
const INGESTION_JOB_RETENTION_DAYS = 7;

export interface PurgeResult {
  articlesDeleted: number;
  clustersDeleted: number;
  ingestionJobsDeleted: number;
}

export async function runPurge(): Promise<PurgeResult> {
  const db = await getDb();

  // Delete old articles; cascades to article_embeddings and cluster_articles
  const { rowCount: articlesDeleted } = await db.query(
    `DELETE FROM articles WHERE published_at < NOW() - INTERVAL '${ARTICLE_RETENTION_DAYS} days'`
  );

  // Delete clusters that have no remaining articles
  const { rowCount: clustersDeleted } = await db.query(
    `DELETE FROM clusters
     WHERE id NOT IN (SELECT DISTINCT cluster_id FROM cluster_articles)`
  );

  // Delete old ingestion job logs
  const { rowCount: ingestionJobsDeleted } = await db.query(
    `DELETE FROM ingestion_jobs WHERE started_at < NOW() - INTERVAL '${INGESTION_JOB_RETENTION_DAYS} days'`
  );

  return {
    articlesDeleted: articlesDeleted ?? 0,
    clustersDeleted: clustersDeleted ?? 0,
    ingestionJobsDeleted: ingestionJobsDeleted ?? 0,
  };
}
