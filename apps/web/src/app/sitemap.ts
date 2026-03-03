import type { MetadataRoute } from "next";
import { getDb } from "../lib/pg";

const BASE_URL =
  process.env.NEXT_PUBLIC_APP_URL ?? "https://bs-news-aggregator-web.vercel.app";

export default async function sitemap(): Promise<MetadataRoute.Sitemap> {
  const static_: MetadataRoute.Sitemap = [
    { url: `${BASE_URL}/`, lastModified: new Date(), changeFrequency: "hourly", priority: 1 },
    { url: `${BASE_URL}/search`, lastModified: new Date(), changeFrequency: "daily", priority: 0.7 },
    { url: `${BASE_URL}/sources`, lastModified: new Date(), changeFrequency: "weekly", priority: 0.5 },
  ];

  try {
    const db = await getDb();
    const { rows } = await db.query<{ id: string; last_published: Date | null }>(`
      SELECT c.id, MAX(a.published_at) AS last_published
      FROM clusters c
      JOIN cluster_articles ca ON ca.cluster_id = c.id
      JOIN articles a ON a.id = ca.article_id
      WHERE a.published_at >= NOW() - INTERVAL '30 days'
        AND a.is_visible = TRUE
      GROUP BY c.id
    `);

    const dynamic: MetadataRoute.Sitemap = rows.map((row) => ({
      url: `${BASE_URL}/story/${row.id}`,
      lastModified: row.last_published ?? new Date(),
      changeFrequency: "hourly" as const,
      priority: 0.9,
    }));

    return [...static_, ...dynamic];
  } catch {
    return static_;
  }
}
