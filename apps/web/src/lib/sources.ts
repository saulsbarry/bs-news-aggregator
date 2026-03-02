import { getDb } from "./pg";
import { cacheGet, cacheSet } from "./cache";

export interface SourceItem {
  id: string;
  name: string;
  slug: string;
  logoUrl: string | null;
  category: string | null;
  language: string | null;
  isActive: boolean;
  lastFetchedAt: Date | null;
}

export async function getSources(): Promise<SourceItem[]> {
  const cached = await cacheGet<SourceItem[]>("sources:v1");
  if (cached) return cached;

  const db = await getDb();
  type SourceRow = {
    id: string;
    name: string;
    slug: string;
    logo_url: string | null;
    category: string | null;
    language: string | null;
    is_active: boolean;
    last_fetched_at: Date | null;
  };
  const { rows } = await db.query<SourceRow>(
    `SELECT id, name, slug, logo_url, category, language, is_active, last_fetched_at
     FROM sources
     ORDER BY name`
  );
  const result = rows.map((r: SourceRow) => ({
    id: r.id,
    name: r.name,
    slug: r.slug,
    logoUrl: r.logo_url,
    category: r.category,
    language: r.language,
    isActive: r.is_active,
    lastFetchedAt: r.last_fetched_at
  }));

  await cacheSet("sources:v1", result, 300);
  return result;
}
