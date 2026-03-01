import Parser from "rss-parser";
import crypto from "node:crypto";
import { getDb } from "../pg";

const parser = new Parser();

interface SourceRow {
  id: string;
  name: string;
  type: "rss" | "api";
  url: string;
  language: string | null;
}

export interface IngestionJobResult {
  sourceId: string;
  sourceName: string;
  fetchedCount: number;
  newArticlesCount: number;
}

export interface IngestionRunSummary {
  jobs: IngestionJobResult[];
}

export async function fetchAllSources(): Promise<IngestionRunSummary> {
  const db = await getDb();

  const { rows: sources } = await db.query<SourceRow>(
    `
      SELECT id, name, type, url, language
      FROM sources
      WHERE is_active = TRUE
    `
  );

  const results: IngestionJobResult[] = [];

  for (const source of sources) {
    const result = await ingestSource(source);
    results.push(result);
  }

  return { jobs: results };
}

async function ingestSource(source: SourceRow): Promise<IngestionJobResult> {
  const db = await getDb();

  const jobRes = await db.query<{ id: number }>(
    `
      INSERT INTO ingestion_jobs (source_id, status)
      VALUES ($1, 'running')
      RETURNING id
    `,
    [source.id]
  );

  const jobId = jobRes.rows[0]?.id;

  let fetchedCount = 0;
  let newArticlesCount = 0;
  let error: string | null = null;

  try {
    if (source.type === "rss") {
      const result = await ingestRssSource(source);
      fetchedCount = result.fetchedCount;
      newArticlesCount = result.newArticlesCount;
    } else {
      throw new Error(`Source type '${source.type}' not yet supported`);
    }
  } catch (err) {
    error =
      err instanceof Error ? err.message : "Unknown error during ingestion";
  }

  if (jobId != null) {
    await db.query(
      `
        UPDATE ingestion_jobs
        SET status = $1,
            finished_at = NOW(),
            error = $2,
            fetched_count = $3,
            new_articles_count = $4
        WHERE id = $5
      `,
      [error ? "failed" : "completed", error, fetchedCount, newArticlesCount, jobId]
    );
  }

  if (!error) {
    await db.query(
      `
        UPDATE sources
        SET last_fetched_at = NOW()
        WHERE id = $1
      `,
      [source.id]
    );
  }

  return {
    sourceId: source.id,
    sourceName: source.name,
    fetchedCount,
    newArticlesCount
  };
}

async function ingestRssSource(source: SourceRow): Promise<{
  fetchedCount: number;
  newArticlesCount: number;
}> {
  const db = await getDb();

  const feed = await parser.parseURL(source.url);

  let fetchedCount = 0;
  let newArticlesCount = 0;

  for (const item of feed.items) {
    const url = item.link;
    const title = item.title;

    if (!url || !title) {
      continue;
    }

    fetchedCount += 1;

    const guid =
      item.guid ??
      hashExternalId(
        `${url}|${item.isoDate ?? ""}|${item.pubDate ?? ""}|${title}`
      );

    const publishedAt =
      (item.isoDate && new Date(item.isoDate)) ||
      (item.pubDate && new Date(item.pubDate)) ||
      new Date();

    const snippet =
      (item as any).contentSnippet ??
      (typeof item.content === "string" ? item.content.slice(0, 280) : null);

    const rawContent =
      (item as any)["content:encoded"] ??
      (typeof item.content === "string" ? item.content : null);

    const imageUrl =
      (item as any).enclosure?.url ??
      (item as any)["media:content"]?.url ??
      null;

    const insertRes = await db.query(
      `
        INSERT INTO articles (
          source_id,
          external_id,
          url,
          title,
          raw_content,
          summary,
          image_url,
          published_at,
          language
        )
        VALUES ($1, $2, $3, $4, $5, $6, $7, $8, $9)
        ON CONFLICT (source_id, external_id) DO NOTHING
        RETURNING id
      `,
      [
        source.id,
        guid,
        url,
        title,
        rawContent,
        snippet,
        imageUrl,
        publishedAt,
        source.language
      ]
    );

    if (insertRes.rowCount && insertRes.rowCount > 0) {
      newArticlesCount += 1;
    }
  }

  return { fetchedCount, newArticlesCount };
}

function hashExternalId(input: string): string {
  return crypto.createHash("sha1").update(input).digest("hex");
}

