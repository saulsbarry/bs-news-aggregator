import Link from "next/link";
import { getSources } from "../../lib/sources";
import { searchArticles } from "../../lib/search";

export const metadata = {
  title: "Search | BS News",
  description: "Search articles by keyword, topic, or source."
};

interface Props {
  searchParams: Promise<{ q?: string; topic?: string; sourceId?: string }>;
}

export default async function SearchPage({ searchParams }: Props) {
  const params = await searchParams;
  const q = params.q ?? "";
  const topic = params.topic;
  const sourceId = params.sourceId;
  const sources = await getSources();
  const result =
    q.trim() || topic || sourceId
      ? await searchArticles(q, { topic, sourceId }, 30)
      : { hits: [] };

  return (
    <div className="space-y-6">
      <section>
        <h1 className="text-2xl font-semibold tracking-tight">Search</h1>
        <p className="text-sm text-slate-500 dark:text-slate-400 mt-1">
          Find articles by keyword. Filter by topic or source below.
        </p>
      </section>

      <form
        method="get"
        action="/search"
        className="flex flex-col gap-3 sm:flex-row sm:items-end sm:gap-4"
      >
        <label className="flex-1 flex flex-col gap-1">
          <span className="text-sm font-medium text-slate-700 dark:text-slate-300">
            Query
          </span>
          <input
            type="search"
            name="q"
            defaultValue={q}
            placeholder="Search articles..."
            className="rounded-lg border border-slate-300 dark:border-slate-600 bg-white dark:bg-slate-900 px-3 py-2 text-sm"
          />
        </label>
        <label className="flex flex-col gap-1">
          <span className="text-sm font-medium text-slate-700 dark:text-slate-300">
            Topic
          </span>
          <input
            type="text"
            name="topic"
            defaultValue={topic ?? ""}
            placeholder="e.g. Technology"
            className="rounded-lg border border-slate-300 dark:border-slate-600 bg-white dark:bg-slate-900 px-3 py-2 text-sm w-40"
          />
        </label>
        <label className="flex flex-col gap-1">
          <span className="text-sm font-medium text-slate-700 dark:text-slate-300">
            Source
          </span>
          <select
            name="sourceId"
            defaultValue={sourceId ?? ""}
            className="rounded-lg border border-slate-300 dark:border-slate-600 bg-white dark:bg-slate-900 px-3 py-2 text-sm min-w-[180px]"
          >
            <option value="">All sources</option>
            {sources.map((s) => (
              <option key={s.id} value={s.id}>
                {s.name}
              </option>
            ))}
          </select>
        </label>
        <button
          type="submit"
          className="rounded-lg bg-slate-900 dark:bg-slate-100 text-white dark:text-slate-900 px-4 py-2 text-sm font-medium hover:opacity-90"
        >
          Search
        </button>
      </form>

      <section>
        <h2 className="text-lg font-medium mb-3">
          {result.hits.length > 0
            ? `${result.hits.length} result(s)`
            : "Results"}
        </h2>
        {result.hits.length === 0 && (q.trim() || topic || sourceId) && (
          <p className="text-sm text-slate-500 dark:text-slate-400">
            No articles match your filters. Try a different query or source.
          </p>
        )}
        {result.hits.length === 0 && !q.trim() && !topic && !sourceId && (
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
