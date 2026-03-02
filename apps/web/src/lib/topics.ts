import { getDb } from "./pg";

export async function getTopics(): Promise<string[]> {
  const db = await getDb();
  type TopicRow = { topic_primary: string };
  const { rows } = await db.query<TopicRow>(
    `SELECT DISTINCT topic_primary
     FROM clusters
     WHERE topic_primary IS NOT NULL
     ORDER BY topic_primary`
  );
  return rows.map((r: TopicRow) => r.topic_primary);
}
