import Link from "next/link";
import { getSources } from "../../lib/sources";
import { formatDistanceToNowStrict } from "date-fns";

export const dynamic = "force-dynamic";

export const metadata = {
  title: "Sources | BS News",
  description: "Browse news sources aggregated by BS News."
};

export default async function SourcesPage() {
  const sources = await getSources();

  return (
    <div className="space-y-6">
      <section>
        <h1 className="text-2xl font-semibold tracking-tight">Sources</h1>
        <p className="text-sm text-slate-500 dark:text-slate-400 mt-1">
          All feeds and APIs we aggregate. Content is updated every 30 minutes.
        </p>
      </section>
      <ul className="grid gap-3 sm:grid-cols-2">
        {sources.map((s) => (
          <li
            key={s.id}
            className="rounded-xl border border-slate-200 dark:border-slate-800 p-4 flex flex-col gap-1"
          >
            <div className="flex items-center justify-between gap-2">
              <span className="font-medium text-slate-900 dark:text-slate-100">
                {s.name}
              </span>
              {!s.isActive && (
                <span className="text-xs text-amber-600 dark:text-amber-400">
                  Inactive
                </span>
              )}
            </div>
            {s.category && (
              <span className="text-xs text-slate-500 dark:text-slate-400">
                {s.category}
                {s.language ? ` · ${s.language}` : ""}
              </span>
            )}
            {s.lastFetchedAt && (
              <span className="text-xs text-slate-500 dark:text-slate-400">
                Last fetched{" "}
                {formatDistanceToNowStrict(s.lastFetchedAt, { addSuffix: true })}
              </span>
            )}
            <Link
              href={`/search?sourceId=${s.id}`}
              className="text-sm text-blue-600 dark:text-blue-400 hover:underline mt-1"
            >
              View articles from this source →
            </Link>
          </li>
        ))}
      </ul>
      {sources.length === 0 && (
        <p className="text-sm text-slate-500 dark:text-slate-400">
          No sources yet. Add sources to the database and run ingestion.
        </p>
      )}
    </div>
  );
}
