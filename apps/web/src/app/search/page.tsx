import Link from "next/link";
import { getSources } from "../../lib/sources";
import { searchArticles } from "../../lib/search";
import { SearchForm } from "../../components/SearchForm";
import type { SearchFilters } from "../../lib/search";

export const metadata = {
  title: "Search | BS News",
  description: "Search articles by keyword, topic, or source."
};

interface Props {
  searchParams: Promise<{ q?: string; topic?: string; sourceId?: string; timeRange?: string }>;
}

export default async function SearchPage({ searchParams }: Props) {
  const params = await searchParams;
  const q = params.q ?? "";
  const topic = params.topic;
  const sourceId = params.sourceId;
  const timeRangeRaw = params.timeRange;
  const validTimeRanges = ["6h", "12h", "24h", "48h", "7d"] as const;
  const timeRange = validTimeRanges.includes(timeRangeRaw as SearchFilters["timeRange"] & string)
    ? (timeRangeRaw as SearchFilters["timeRange"])
    : undefined;
  const sources = await getSources();
  const result =
    q.trim() || topic || sourceId || timeRange
      ? await searchArticles(q, { topic, sourceId, timeRange }, 30)
      : { hits: [] };

  return (
    <div className="space-y-6">
      <section>
        <h1 className="text-2xl font-semibold tracking-tight">Search</h1>
        <p className="text-sm text-slate-500 dark:text-slate-400 mt-1">
          Find articles by keyword. Filter by topic or source below.
        </p>
      </section>

      <SearchForm
        q={q}
        topic={topic ?? ""}
        sourceId={sourceId ?? ""}
        timeRange={timeRangeRaw ?? ""}
        sources={sources}
      />

      <section>
        <h2 className="text-lg font-medium mb-3">
          {result.hits.length > 0
            ? `${result.hits.length} result(s)`
            : "Results"}
        </h2>
        {result.hits.length === 0 && (q.trim() || topic || sourceId || timeRange) && (
          <p className="text-sm text-slate-500 dark:text-slate-400">
            No articles match your filters. Try a different query or source.
          </p>
        )}
        {result.hits.length === 0 && !q.trim() && !topic && !sourceId && !timeRange && (
          <p className="text-sm text-slate-500 dark:text-slate-400">
            Enter a search term or choose a filter to see results.
          </p>
        )}
        <ul className="space-y-3">
          {result.hits.map((hit) => (
            <li
              key={hit.id}
              className="rounded-lg border border-slate-200 dark:border-slate-800 p-4"
            >
              <Link
                href={`/article/${hit.id}`}
                className="font-medium text-slate-900 dark:text-slate-100 hover:underline"
              >
                {hit.title}
              </Link>
              <div className="flex flex-wrap items-center gap-2 text-xs text-slate-500 dark:text-slate-400 mt-1">
                <span>{hit.sourceName}</span>
                <span>·</span>
                <span>{new Date(hit.publishedAt).toLocaleString()}</span>
                {hit.clusterId && hit.clusterTitle && (
                  <>
                    <span>·</span>
                    <Link
                      href={`/story/${hit.clusterId}`}
                      className="text-blue-600 dark:text-blue-400 hover:underline"
                    >
                      {hit.clusterTitle}
                    </Link>
                  </>
                )}
              </div>
              {hit.summary && (
                <p className="text-sm text-slate-600 dark:text-slate-300 mt-2 line-clamp-2">
                  {hit.summary}
                </p>
              )}
            </li>
          ))}
        </ul>
      </section>
    </div>
  );
}
